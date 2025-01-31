import os
from Chunking import chunks
from langchain_google_genai import GoogleGenerativeAIEmbeddings
# from langchain.chat_models import ChatVertexAI
from langchain_google_vertexai import ChatVertexAI


os.environ['LANGCHAIN_TRACING_V2'] = 'true'
os.environ['LANGCHAIN_ENDPOINT'] = 'https://api.smith.langchain.com'
os.environ['LANGCHAIN_API_KEY'] = "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"

import bs4
from langchain import hub
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import Chroma
from langchain_core.output_parsers import StrOutputParser
# from langchain_core.runnables import RunnablePassthrough
from langchain.schema import Document

chunks = chunks[:2]
chunks[0] = "Patient is having high fever"
chunks[1] = "Patient is having vomiting"
print("###################")
print(chunks)
print("###################")

documents = [Document(page_content=chunk) for chunk in chunks]

# documents = documents[0:2] # To avoid the resource exhausted error

# TODO: Some of the metadata of the chunks also can be placed in the vector DB
vectorstore = Chroma.from_documents(
    documents,
    embedding=GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    )

import uuid

# from langchain_core.documents import Document
# from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
# from langchain_openai import ChatOpenAI

llm = ChatVertexAI(
    model="gemini-1.5-pro-002"
)

chain = (
    {"doc": lambda x: x.page_content}
    | ChatPromptTemplate.from_template("Summarize the following document:\n\n{doc}")
    # | ChatOpenAI(model="gpt-3.5-turbo",max_retries=0)
    | llm
    | StrOutputParser()
)

summaries = chain.batch(documents, {"max_concurrency": 5})
# TODO: ResourceExhausted: 429 Online prediction request quota exceeded -> request for increase quota or go with OpenAI
# print(summaries)

from langchain.storage import InMemoryByteStore
# from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.retrievers.multi_vector import MultiVectorRetriever

# The vectorstore to use to index the child chunks
vectorstore = Chroma(collection_name="summaries",
                     embedding_function=GoogleGenerativeAIEmbeddings(model="models/embedding-001"))

# The storage layer for the parent documents
store = InMemoryByteStore()
id_key = "doc_id"

# The retriever
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    byte_store=store,
    id_key=id_key,
)
doc_ids = [str(uuid.uuid4()) for _ in documents]

# Docs linked to summaries
summary_docs = [
    Document(page_content=s, metadata={id_key: doc_ids[i]})
    for i, s in enumerate(summaries)
]

# Add
retriever.vectorstore.add_documents(summary_docs)
retriever.docstore.mset(list(zip(doc_ids, documents)))

query = "Patient issues"
sub_docs = vectorstore.similarity_search(query,k=1)
# sub_docs[0]

retrieved_docs = retriever.get_relevant_documents(query,n_results=1)
# retrieved_docs[0].page_content[0:500]
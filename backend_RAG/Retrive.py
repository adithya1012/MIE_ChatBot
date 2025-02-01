from Indexing import vectorstore, llm
from langchain import hub
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# Initialize the retriever properly
retriever = vectorstore.as_retriever(search_kwargs={"k": 1})

# Pull the RAG prompt template
prompt = hub.pull("rlm/rag-prompt")

# Function to format retrieved documents
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Ensure retriever is a valid runnable before using the `|` operator
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

def ask_llm(question):
    if question:
        answer = rag_chain.invoke(question)
    else:
        answer = "No question provided"
    return answer

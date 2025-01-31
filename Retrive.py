from Indexing import retrieved_docs
from Indexing import vectorstore, llm
from langchain import hub
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

retriever = vectorstore.as_retriever(search_kwargs={"k":1})

docks = retriever.get_relevant_documents("what is patient current problem")
# len(docks)



# Prompt
prompt = hub.pull("rlm/rag-prompt")
# print(prompt)
# LLM
# llm = ChatVertexAI(
#     model="gemini-1.5-flash-001"
# )

# Post-processing
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Chain
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# Question
print("********************************")
print(rag_chain.invoke("what is patient current problem"))
print("********************************")
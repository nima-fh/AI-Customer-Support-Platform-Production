from app.ai.rag.vectorstore import create_vectorstore

if __name__ == "__main__":
    vectorstore = create_vectorstore()
    print("Vector store created successfully.")

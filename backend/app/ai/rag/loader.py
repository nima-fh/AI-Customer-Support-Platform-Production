from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader, TextLoader

documents_dir = Path(__file__).resolve().parents[4] / "data" / "documents"


def load_documents():
    documents = []

    for file_path in documents_dir.glob("**/*"):
        if file_path.suffix.lower() == ".pdf":
            loader = PyPDFLoader(str(file_path))
            documents.extend(loader.load())
        elif file_path.suffix.lower() == ".txt":
            loader = TextLoader(str(file_path), encoding="utf-8")
            documents.extend(loader.load())

    return documents

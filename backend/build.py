"""Copy the shared story graph into the backend's deployment bundle."""
from pathlib import Path
from shutil import copyfile


if __name__ == "__main__":
    backend = Path(__file__).resolve().parent
    copyfile(backend.parent / "questions_v3.json", backend / "questions_v3.json")

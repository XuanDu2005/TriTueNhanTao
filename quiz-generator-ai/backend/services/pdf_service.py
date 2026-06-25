import re
import pdfplumber


def extract_text_from_pdf(file_path: str) -> str:
    full_text = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text.append(text)

    raw_text = '\n'.join(full_text)
    cleaned_text = clean_text(raw_text)
    return cleaned_text


def clean_text(text: str) -> str:
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'[^\S\n]{2,}', ' ', text)
    text = re.sub(r'-\n(\w)', r'\1', text)
    text = re.sub(r'\x00', '', text)
    text = text.strip()
    return text

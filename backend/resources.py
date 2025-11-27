from pypdf import PdfReader
import json

# Read LinkedIn PDF
try:
    reader = PdfReader("./data/linkedin.pdf")
    linkedin = ""
    for page in reader.pages:
        text = page.extract_text()
        if text:
            linkedin += text
except FileNotFoundError:
    linkedin = "LinkedIn profile not available"

try:
    reader_r = PdfReader("./data/resume.pdf")
    resume = ""
    for page in reader_r.pages:
        text = page.extract_text()
        if text:
            resume += text
except FileNotFoundError:
    resume = "Resume not available"
    
# Read other data files
try:
    with open("./data/summary.txt", "r", encoding="utf-8") as f:
        summary = f.read()
except FileNotFoundError:
    summary = "Summary not available"

try:
    with open("./data/style.txt", "r", encoding="utf-8") as f:
        style = f.read()
except FileNotFoundError:
    style = "Style guide not available"

try:
    with open("./data/facts.json", "r", encoding="utf-8") as f:
        facts = json.load(f)
except FileNotFoundError:
    facts = {}
except json.JSONDecodeError:
    facts = {}
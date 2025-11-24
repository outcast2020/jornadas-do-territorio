import re
import sys

def extract_text(pdf_path):
    try:
        with open(pdf_path, 'rb') as f:
            content = f.read()
            # Try to find text streams (this is very basic and might fail for compressed streams)
            # But often PDFs have some plain text or we can find strings.
            # Actually, a better heuristic for raw binary is just looking for long sequences of printable chars.
            # This won't be perfect but might give us the poems.
            
            # Regex for sequences of printable characters (at least 20 chars)
            # We include portuguese characters
            pattern = re.compile(b'[a-zA-Z0-9\s\.,;:\-\?!áàâãéèêíïóôõöúçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ]{20,}')
            matches = pattern.findall(content)
            
            print(f"Found {len(matches)} text fragments.")
            for m in matches:
                try:
                    decoded = m.decode('utf-8', errors='ignore')
                    # Filter out garbage
                    if len(decoded.strip()) > 30:
                        print("--- FRAGMENT ---")
                        print(decoded.strip())
                except:
                    pass
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_text("Livro-eletronico_Cordel2.0_Vol1-Site2.pdf")

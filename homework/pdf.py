import PyPDF2
import os

def merge_pdfs(pdf_list, output):
    pdf_writer = PyPDF2.PdfWriter()

    for pdf in pdf_list:
        pdf_reader = PyPDF2.PdfReader(pdf)
        for page in range(len(pdf_reader.pages)):
            pdf_writer.add_page(pdf_reader.pages[page])

    with open(output, 'wb') as out:
        pdf_writer.write(out)

if __name__ == "__main__":
    DIR = os.path.dirname(os.path.abspath(__file__))
    PATH = os.path.join(DIR, "pdfs/")


    pdf_files = ["1.pdf", "2.pdf"]
    pdf_files = [PATH + pdf for pdf in pdf_files]

    # 合并后的 PDF 文件
    output_pdf = PATH + "PanZhiQing24037665G.pdf"

    merge_pdfs(pdf_files, output_pdf)
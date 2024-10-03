import PyPDF2

def merge_pdfs(pdf_list, output):
    pdf_writer = PyPDF2.PdfWriter()

    for pdf in pdf_list:
        pdf_reader = PyPDF2.PdfReader(pdf)
        for page in range(len(pdf_reader.pages)):
            pdf_writer.add_page(pdf_reader.pages[page])

    with open(output, 'wb') as out:
        pdf_writer.write(out)

if __name__ == "__main__":

    # PARENT_DIR = "G:\\polyulessons\\LSGI522\\Practicals\\Practical1"  G:\polyulessons\CE631\Quiz
    PARENT_DIR = "G:\\polyulessons\\CE631\\"
    PATH = PARENT_DIR + "\\Quiz\\"

    # 需要合并的 PDF 文件列表
    pdf_files = ["Quizz1.pdf","PanZhiQing24037665g.pdf"]
    pdf_files = [PATH + pdf for pdf in pdf_files]

    # 合并后的 PDF 文件
    output_pdf = PATH + "PanZhiQing24037665G.pdf"

    merge_pdfs(pdf_files, output_pdf)
import re
import pandas as pd
import os
import matplotlib.pyplot as plt
import numpy as np

def parse_simulation_data(file_content):
    """
    解析包含Queue部分的表格数据，返回DataFrame
    """
    lines = file_content.splitlines()
    queue_section = []
    capture = False

    for line in lines:
        if "Queue" in line and "Res" in line:
            # 也保留标题行
            queue_section.append(line.strip())
            capture = True
            continue
        if "Activity" in line and "Cur" in line:
            break
        if capture:
            queue_section.append(line.strip())
    
    # 删除 ====== 分割线
    queue_section = [line for line in queue_section if not re.match(r"=+", line)]
    
    # 解析Queue表格为DataFrame
    if queue_section:
        # print(queue_section)
        return parse_table(queue_section, header_row=0)
    return None

def parse_table(section_data, header_row=0):
    """
    解析段落中的表格数据为 Pandas DataFrame。

    参数:
    section_data (list of str): 包含表格数据的文本列表，每行为一个字符串。
    header_row (int): 表示标题行的索引，默认为 0。

    返回:
    pd.DataFrame: 包含解析结果的 DataFrame。
    """
    if not section_data:
        raise ValueError("输入的表格数据为空。")

    # 提取标题行
    headers = re.split(r"\s{2,}", section_data[header_row].strip())
    
    # 提取数据行
    data_lines = section_data[header_row + 1:]
    data = []

    for line in data_lines:
        if line.strip():  # 跳过空行
            row = re.split(r"\s{2,}", line.strip())
            if len(row) == len(headers):  # 确保数据行列数与标题一致
                data.append(row)
            else:
                # 如果列数不一致，补充空值或截断
                row = row[:len(headers)] + [""] * (len(headers) - len(row))
                data.append(row)
    
    # 检查是否存在有效数据
    if not data:
        raise ValueError("未找到有效的表格数据行。")

    # 将数据转换为 DataFrame
    df = pd.DataFrame(data, columns=headers)
    
    # 尝试将列数据转换为数值类型（若可能）
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='ignore')

    return df

def filePath(numCrew, numForm):
    return os.path.join(PATH, f'crew{numCrew}form{numForm}.txt')

def readData(numCrew, numForm):
    with open(filePath(numCrew, numForm), 'r') as file:
        content = file.read()
    return content

def parseData(numCrew, numForm):
    content = readData(numCrew, numForm)
    queue_data = parse_simulation_data(content)
    return queue_data

def parseDataAll():
    data = {}
    for crew in numCrew:
        for form in numForm:
            data[(crew, form)] = parseData(crew, form)
    return data

## Visualization
# 热力图 每一个队列的平均等待时间
def plotHeatMap(data):
    queueNames = data[(2,2)]['Queue'].values

    # 共 13 个子图 4 * 3 
    fig, axs = plt.subplots(4, 4, figsize=(20, 20))
    fig.suptitle('Heat Map of Average Waiting Time in Queues', fontsize=20)


    for index,Value in enumerate(queueNames):
        # 一个 4 * 4 的矩阵
        tmp = np.zeros((4,4))
        for key, value in data.items():
            tmp[key[0]//2-1][key[1]//2-1] = value['AvWait'][index]

        # 绘制热力图
        ax = axs[index//4][index%4]
        im = ax.imshow(tmp, cmap='hot')

        # 设置标题
        ax.set_title(f'Queue {Value}')

        # 设置坐标轴
        ax.set_xticks(np.arange(4))
        ax.set_yticks(np.arange(4))
        ax.set_xticklabels(numForm)
        ax.set_yticklabels(numCrew)
        ax.set_xlabel('Form')
        ax.set_ylabel('Crew')
    
    # 添加 colorbar
    cbar = fig.colorbar(im, ax=axs.ravel().tolist())
    cbar.set_label('Average Waiting Time')
    
    # 保存图片
    plt.savefig(os.path.join(PATH, 'heatMap.png'))

# 示例文件路径
DIR = os.path.dirname(__file__)
PATH = os.path.join(DIR, '..', 'output')
PATH1 = os.path.join(PATH, 'crew2form2.txt')

numCrew = [2,3,4,5]
numForm = [2,4,6,8]

if __name__ == "__main__":
    # 测试解析所有文件
    data = parseDataAll()

    plotHeatMap(data)


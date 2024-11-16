import os

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

DIR_PATH = os.path.dirname(os.path.realpath(__file__))

DATA_PATH = os.path.join(DIR_PATH,'data')
DATA_PATH1 = os.path.join(DATA_PATH,'daily_SC_PDIR_ALL.csv') # 风向
DATA_PATH2 = os.path.join(DATA_PATH,'daily_SC_WSPD_ALL.csv') # 风速
DATA_PATH3 = os.path.join(DATA_PATH,'daily_CCH_RH_ALL.csv') # 湿度

SAVE_PATH = os.path.join(DIR_PATH,'output')
SAVE_PATH1 = os.path.join(SAVE_PATH,'daily_SC_PDIR_ALL.csv')
SAVE_PATH2 = os.path.join(SAVE_PATH,'daily_SC_WSPD_ALL.csv')
SAVE_PATH3 = os.path.join(SAVE_PATH,'daily_CCH_RH_ALL.csv')

def pre_process(data_paths, save_paths):
    for data_path, save_path in zip(data_paths, save_paths):
        filter_invalid(data_path, save_path)

def humidity(data_path):
    df = pd.read_csv(data_path)
    df['數值/Value'] = df['數值/Value'].astype(float)
    # 年/Year,月/Month,日/Day, 合并为日期
    df['date'] = pd.to_datetime(df['年/Year'].astype(str) + '-' + df['月/Month'].astype(str) + '-' + df['日/Day'].astype(str))
    # print(df.head())

    # 绘制湿度直方图、箱线图和时间序列图
    humidity_visualization(df)

    humidity_mean = df['數值/Value'].mean()
    humidity_std = df['數值/Value'].std()

    print('Mean humidity:', humidity_mean)
    print('Standard deviation of humidity:', humidity_std)

def humidity_visualization(df):
    # 绘制湿度直方图
    plt.figure(figsize=(8, 6))
    sns.histplot(df['數值/Value'], bins=20, kde=True)
    plt.xlabel('Humidity')

    plt.title('Histogram of humidity')
    plt.show()

    # 绘制湿度箱线图
    plt.figure(figsize=(8, 6))
    sns.boxplot(x=df['數值/Value'])
    # set x-axis label
    plt.xlabel('Humidity')
    plt.title('Box plot of humidity')
    plt.show()

    # 绘制湿度时间序列图
    plt.figure(figsize=(12, 6))
    plt.plot(df['date'], df['數值/Value'])
    plt.xlabel('Date')
    plt.ylabel('Humidity')
    plt.title('Time series plot of humidity')
    plt.show()

    # 将每一年的时间序列数据叠加在一起 df['date'] 一年12个月
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    # print(df.head())

    # 绘制每年的湿度时间序列图
    plt.figure(figsize=(12, 6))
    for year in df['year'].unique():
        df_year = df[df['year'] == year]
        plt.plot(df_year['month'], df_year['數值/Value'], label=str(year))
    
    plt.xlabel('Month')
    plt.ylabel('Humidity')
    plt.title('Time series plot of humidity by year')
    plt.legend()

    plt.show()

    # 绘制湿度的累计分布曲线
    plt.figure(figsize=(8, 6))
    sns.ecdfplot(df['數值/Value'])
    plt.xlabel('Humidity')
    plt.ylabel('Cumulative probability')
    plt.title('ECDF of humidity')
    plt.show()

    # 概率密度函数
    plt.figure(figsize=(8, 6))
    sns.kdeplot(df['數值/Value'], fill=True)
    plt.xlabel('Humidity')
    plt.ylabel('Density')
    plt.title('KDE plot of humidity')
    plt.show()

def wind_sped(data_path):
    df = pd.read_csv(data_path)
    df['數值/Value'] = df['數值/Value'].astype(float)
    # 年/Year,月/Month,日/Day, 合并为日期
    df['date'] = pd.to_datetime(df['年/Year'].astype(str) + '-' + df['月/Month'].astype(str) + '-' + df['日/Day'].astype(str))
    # print(df.head())

    # 绘制风速直方图、箱线图和时间序列图
    wind_sped_visualization(df)


    wind_sped_mean = df['數值/Value'].mean()
    wind_sped_std = df['數值/Value'].std()

    print('Mean wind speed:', wind_sped_mean)
    print('Standard deviation of wind speed:', wind_sped_std)

def wind_sped_visualization(df):
    # 绘制风速直方图
    plt.figure(figsize=(8, 6))
    sns.histplot(df['數值/Value'], bins=20, kde=True)
    plt.xlabel('Wind speed')

    plt.title('Histogram of wind speed')
    plt.show()

    # 绘制风速箱线图
    plt.figure(figsize=(8, 6))
    sns.boxplot(x=df['數值/Value'])
    # set x-axis label
    plt.xlabel('Wind speed')
    plt.title('Box plot of wind speed')
    plt.show()

    # 绘制风速时间序列图
    plt.figure(figsize=(12, 6))
    plt.plot(df['date'], df['數值/Value'])
    plt.xlabel('Date')
    plt.ylabel('Wind speed')
    plt.title('Time series plot of wind speed')
    plt.show()

    # 将每一年的时间序列数据叠加在一起 df['date'] 一年12个月
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    # print(df.head())

    # 绘制每年的风速时间序列图
    plt.figure(figsize=(12, 6))
    for year in df['year'].unique():
        df_year = df[df['year'] == year]
        plt.plot(df_year['month'], df_year['數值/Value'], label=str(year))
    
    plt.xlabel('Month')
    plt.ylabel('Wind speed')
    plt.title('Time series plot of wind speed by year')
    plt.legend()

    plt.show()

    # 绘制风速的累计分布曲线
    plt.figure(figsize=(8, 6))
    sns.ecdfplot(df['數值/Value'])
    plt.xlabel('Wind speed')
    plt.ylabel('Cumulative probability')
    plt.title('ECDF of wind speed')
    plt.show()

    # 概率密度函数
    plt.figure(figsize=(8, 6))
    sns.kdeplot(df['數值/Value'], fill=True)
    plt.xlabel('Wind speed')
    plt.ylabel('Density')
    plt.title('KDE plot of wind speed')
    plt.show()

def filter_invalid(DATA_PATH,SAVE_PATH):
    # 忽略最后五行
    # 读取数据时，跳过前两行 
    df = pd.read_csv(DATA_PATH, skiprows=2, skipfooter=5, engine='python')
    print(df.head())

    # 仅仅保留 Completeness 为 C 的数据
    df = df[df['數據完整性/data Completeness'] == 'C']
    print(df.head())

    # 保存数据
    df.to_csv(SAVE_PATH, index=False)

def wind_dir(data_path):
    df = pd.read_csv(data_path)
    df['數值/Value'] = df['數值/Value'].astype(int)

    # 将 0 - 360 转换为 N, NE, E, SE, S, SW, W, NW
    df['wind_dir'] = df['數值/Value'].apply(lambda x: wind_dir_mapping(x))

    # 绘制风向条形图和雷达图
    wind_dir_visualization(df)

    # 统计每个风向出现的概率 0-1
    wind_dir_prob = df['wind_dir'].value_counts(normalize=True)
    print(wind_dir_prob)

def wind_dir_visualization(df):
    # Prepare data for radar plot
    categories = ['W', 'NW','N', 'NE', 'E', 'SE', 'S', 'SW']

    # 统计风向数据
    wind_dir_count = df['wind_dir'].value_counts()
    values = [wind_dir_count[cat] for cat in categories]

    # 绘制条形图
    plt.figure(figsize=(8, 6))
    sns.barplot(x=categories, y=values)
    plt.title('Bar plot of wind direction')
    plt.show()

    # 绘制风向雷达图
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))

    # 设置角度
    angles = np.linspace(0, 2 * np.pi, len(categories), endpoint=False).tolist()

    # 绘制雷达图
    ax.fill(angles, values, color='blue', alpha=0.25)
    ax.plot(angles, values, color='blue', linewidth=2)

    # 添加类别标签
    ax.set_xticks(angles)
    ax.set_xticklabels(categories)

    # 显示图表
    plt.title('Radar plot of wind direction')
    plt.show()

def wind_dir_mapping(degree):
    if 0 <= degree < 22.5 or 337.5 <= degree <= 360:
        return 'N'
    elif 22.5 <= degree < 67.5:
        return 'NE'
    elif 67.5 <= degree < 112.5:
        return 'E'
    elif 112.5 <= degree < 157.5:
        return 'SE'
    elif 157.5 <= degree < 202.5:
        return 'S'
    elif 202.5 <= degree < 247.5:
        return 'SW'
    elif 247.5 <= degree < 292.5:
        return 'W'
    elif 292.5 <= degree < 337.5:
        return 'NW'



if __name__ == '__main__':
    # print(DIR_PATH)
    # print(DATA_PATH)
    # print(DATA_PATH1)

    # pre_process([DATA_PATH1, DATA_PATH2,DATA_PATH3], [SAVE_PATH1, SAVE_PATH2,SAVE_PATH3])

    # wind_dir(SAVE_PATH1)
    # wind_sped(SAVE_PATH2)
    humidity(SAVE_PATH3)





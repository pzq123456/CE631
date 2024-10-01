# Quiz 1
> - PanZhiQing 24037665g
## Problem Description
In GIS(Geographic Information System), we have a full workflow for remote sensing data aquistion, processing, and analysis. In this quiz, we will focus on the LANDSAT 8 Satellite data processing workflow. Just as they discribed in the handbook$^1$, "Products available for download immediately; higher-level products available for download within 72 hours.", this workflow is a high-efficiency and typical remote sensing data processing workflow.

LANDSAT 8 Satellite can acquire about 700 scenes per day, and these data are all stored in the USGS archive. The satellite uses cloud cover predictions to avoid acquiring less useful data. It offers 16-day repetitive Earth coverage. A typical remote sensing data processing workflow can be described as follows:

### 1. Data Download

A standard size of LANDSAT 8 scene covers about 170 km x 183 km of the Earth's surface. The size of a single scene is about 700MB to 1GB. The Internet speed is about 1MB/s. So, the download time for a single scene is about 12 minutes.

### 2. Signal Noise Removal
There are many kinds of noise in the remote sensing data, such as the line-drop noise, the random noise, and so on. For a single scene, the signal noise removal process takes about 10 minutes.

![](./imgs/p1.png)

Figure 1. A Simple Random Noise Removal Process

### 3. Radiometric Correction
The satellite sensor can only capture the radiance of the Earth's surface(DN). The radiometric correction process is to convert the DN to the reflectance. This process is a simple linear transformation process. For a single scene, the radiometric correction process takes about 2 minutes.

### 4. Atmospheric Correction
The target of remote sensing is the Earth's surface, but the atmosphere will affect the remote sensing data. We can first measure the atmospheric influence and then correct the remote sensing data. A typical atmospheric correction process is the Dark Object Subtraction(DOS) method which needs to find the darkest object in the scene and then correct the whole scene. For a single scene, it will take about 3 minutes to find the darkest object and then take about 5 minutes to correct the whole scene.

### 5. Topographic Correction
The uneven terrain of the Earth surface is a key factor that leads to distortion in the remote sensing data. We tendto need the DEM(Digital Elevation Model) data to correct the remote sensing data. The DEM acquisition process is about 5 minutes, and the simple topographic correction process(Cosine Correction) is about 15 minutes.

<!-- ![](./imgs/p2.png) -->
<!-- 设置大小 -->
<img src="./imgs/p2.png" width = "50%" height = "50%" alt="p2" align=center />

Figure 2. Cosine Correction Process

### 6. Geometric Correction
In Geographic and Surveying, we need the control points to attach the remote sensing data to real-world coordinates. The geometric correction process is to find the control points and then resample the remote sensing data to the real-world coordinates. For a single scene, it will take about 10 minutes to find the control points (at least 4 points) and then take about 5 minutes to correct the whole scene.

The control points are usually selected the easily recognizable points, such as the road intersection, the building corner, and so on. So we need a detailed map to find the control points and a experienced operator to select the control points. So, we can consider that map acquisition process is about 5 minutes and the control points selection process is about 5 minutes(10 minutes in total).

![](./imgs/p3.png)
Figure 3. Control Points Attachment Process

### 7. Performance Evaluation
In this stage, we need to calculate the RMSE(Root Mean Square Error) to evaluate the performance of the remote sensing data processing workflow and then classify the remote sensing data in two classes: Tier 1 and Tier 2. The probability of the Tier 1 class varies with the cloud cover percentage of the scene. The probability of the Tier 1 and Tier 2 class for Landsat 8 OLI/TIRS is shown in Table 1. The performance evaluation process takes about 5 minutes. In next step, we only care about the Tier 1 class.

| Cloud Cover \ Products Values = % | 0-10 | 11-20 | 21-30 | 31-40 | 41-50 | 51-60 | 61-70 | 71-80 | 81-90 | 91-100 | Night | All |
|-----------------------------------|------|-------|-------|-------|-------|-------|-------|-------|-------|--------|-------|-----|
| L1TPT1                            | 76.5 | 76.5  | 77.3  | 77.0  | 76.0  | 74.2  | 72.2  | 69.3  | 61.7  | 22.7   | 1.1   | 63.3|
| L1TPT2                            | 3.7  | 3.9   | 3.7   | 3.7   | 3.8   | 3.8   | 3.7   | 3.4   | 3.3   | 2.8    | 0.5   | 3.5 |
| L1GTFB                            | 2.3  | 3.8   | 4.6   | 5.5   | 6.8   | 8.4   | 10.5  | 14.0  | 21.8  | 52.4   | 7.8   | 15.1|
| L1GTT2                            | 17.4 | 15.8  | 14.4  | 13.7  | 13.4  | 13.5  | 13.6  | 13.3  | 13.2  | 22.1   | 90.6  | 18.2|

Table 1. The Probability of the Tier 1 and Tier 2 Class for Landsat 8 OLI/TIRS$^2$

### 8. Format and Package
Until this stage, the pre processing of the remote sensing data is finished. The format and package process takes about 2 minutes.

### 9. Cloud Removal
For Landsat 8 OLI/TIRS, the cloud removal process is a spectral dependence process. The cirrus band 9 (QA band) is used to detect the cloud. QA band based cloud removal process is very fast, it only takes about 1 minute for simple cloud removal.
![](./imgs/p4.png)
Figure 4. Landsat 8 OLI/TIRS QA Band Band 9

### 10. Classification and Change Detection
We can detect the land cover of the remote sensing data by using the supervised classification method which needs the hand labeled training data. Labeling the training data is a time-consuming process, it takes about 20 minutes. The classification process is about 10 minutes. The change detection process is about 5 minutes.

### 11. Report Generation
We need write a report to summarize the remote sensing data processing workflow. The report may take about 30 minutes.

## EzStrobe model

## Analysis and Benefits 
From the above workflow, we can see that the remote sensing data processing workflow is a multi-step process, each step involves different data processing techniques and algorithms. The workflow is time-consuming and resource-intensive, requiring high-performance computing resources, storage resources, and network resources. The workflow can be used in various applications, such as land cover classification, change detection, environmental monitoring, disaster management, urban planning, agriculture, forestry, and many others. The benefits of the simulation model include:

1. **Efficiency**: The simulation model can help optimize the remote sensing data processing workflow, identify bottlenecks, and improve efficiency.
2. **Resource Planning**: The simulation model can help plan resources, estimate task duration, and number of resources required for each step of the workflow.
3. **Performance Evaluation**: The simulation model can be used to evaluate the performance of the remote sensing data processing workflow and compare different processing strategies.
4. **Training and Education**: The simulation model can be used for training and education purposes to teach students and professionals about remote sensing data processing techniques and algorithms.
5. **Decision Support**: The simulation model can be used as a decision support tool for policymakers, researchers, and practitioners in various fields.


## References
1. [Landsat 8 (L8) Data Users Handbook](https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/atoms/files/LSDS-1574_L8_Data_Users_Handbook-v5.0.pdf)
2. [Landsat Levels of Processing](https://www.usgs.gov/landsat-missions/landsat-levels-processing)
# Quiz 1
Think about a problem in your domain of expertise. 

1. Write it down in a detailed way  with  the  required  description.  
    - Use images, charts,  figures, and  tables to  support the problem description. 
    - Hence, model it using MicroCYCLONE notations.  
    - Estimate  task  duration  and  number  of  resources  as  per  the  above  description. 
    - Simulate the problem using EzStrobe and show all the results and reports using the software. 

- Submit the answer online in one pdf file using the Black Board link before noon on October 07, 2024. Your model should not have less than 15 nodes. Please comment on the developed model and how you can use it in reality. The answer should include: 
  - a. Problem description and supported images, charts, figures, and tables. 
  - b. EZStrobe model with all the required reports. 
  - c. Your analysis of the problem and the benefits of your simulation model.

## Problem Description
In GIS(Geographic Information System), we have a full workflow for remote sensing data aquistion, processing, and analysis. In this quiz, we will focus on the LANDSAT 8 Satellite data processing workflow. Just as they discribed in the handbook$^1$, "Products available for download immediately; higher-level products available for download within 72 hours.", this workflow is a high-efficiency and typical remote sensing data processing workflow.

LANDSAT 8 Satellite can acquire about 700 scenes per day, and these data are all stored in the USGS archive. The satellite uses cloud cover predictions to avoid acquiring less useful data. It offers 16-day repetitive Earth coverage.

云覆盖率与产品值的关系如下表所示：
| Cloud Cover \ Products Values = % | 0-10 | 11-20 | 21-30 | 31-40 | 41-50 | 51-60 | 61-70 | 71-80 | 81-90 | 91-100 | Night | All |
|-----------------------------------|------|-------|-------|-------|-------|-------|-------|-------|-------|--------|-------|-----|
| L1TPT1                            | 76.5 | 76.5  | 77.3  | 77.0  | 76.0  | 74.2  | 72.2  | 69.3  | 61.7  | 22.7   | 1.1   | 63.3|
| L1TPT2                            | 3.7  | 3.9   | 3.7   | 3.7   | 3.8   | 3.8   | 3.7   | 3.4   | 3.3   | 2.8    | 0.5   | 3.5 |
| L1GTFB                            | 2.3  | 3.8   | 4.6   | 5.5   | 6.8   | 8.4   | 10.5  | 14.0  | 21.8  | 52.4   | 7.8   | 15.1|
| L1GTT2                            | 17.4 | 15.8  | 14.4  | 13.7  | 13.4  | 13.5  | 13.6  | 13.3  | 13.2  | 22.1   | 90.6  | 18.2|
Landsat 8 OLI/TIRS 

## EzStrobe model

## Analysis

## References
1. [Landsat 8 (L8) Data Users Handbook](https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/atoms/files/LSDS-1574_L8_Data_Users_Handbook-v5.0.pdf)
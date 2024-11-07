## Programming
- Full programmable
- Approachable syntax
- Language is Logo dialect extended to support agents
- Mobile agents (turtles) move over a grid of stationary agents (patches)
- Link agents connect turtles to make networks, graphs, and aggregates
- Large vocabulary of built-in language primitives
- Double precision floating point math
- First-class function values (aka tasks, closures, lambda)
- Runs are reproducible cross-platform
  

## Coding Challenge #85: The Game of Life
- https://editor.p5js.org/codingtrain/sketches/UtSMCB1zv
- https://www.youtube.com/watch?v=FWSR_7kZuYg&list=PLRqwX-V7Uu6ZiZxtDDRCi6uhfTH4FilpH&index=122

## Coding Challenge #10.1: Maze Generator with p5.js - Part 1
- https://www.youtube.com/watch?v=HyK_Q5rrcr4&list=PLRqwX-V7Uu6ZiZxtDDRCi6uhfTH4FilpH&index=11

## Coding Challenge #56: Attraction and Repulsion Forces
- https://www.youtube.com/watch?v=OAcXnzRNiCY&list=PLRqwX-V7Uu6ZiZxtDDRCi6uhfTH4FilpH&index=74

## Coding Challenge #57: Mapping Earthquake Data
- https://www.youtube.com/watch?v=ZiYdOwOrGyc&list=PLRqwX-V7Uu6ZiZxtDDRCi6uhfTH4FilpH&index=75

## Data Source Weather
- https://nomads.ncep.noaa.gov
- https://nomads.ncep.noaa.gov/dods/

## Data Source Solar
https://tweakpane.github.io/docs/
https://www.worldatlas.org
https://observablehq.com/@d3/gallery?utm_source=d3js-org&utm_medium=page-nav&utm_campaign=try-observable

该代码主要用于从GFS（Global Forecast System）模型中获取并处理气象数据，包括**风**和**太阳辐射（solar）**，然后通过`react-query`缓存数据，以便在页面中轻松访问这些数据。以下是代码的详细解析：
```ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { add, startOfHour, sub } from 'date-fns';
import { getInterpolatedData } from 'features/weather-layers/weatherUtils';
import type { Maybe } from 'types';

import { FIVE_MINUTES, getBasePath, getHeaders } from './helpers';

export type WeatherType = 'wind' | 'solar';

export interface ForecastEntry {
  data: number[];
  header: {
    dx: number;
    dy: number;
    forecastTime: number;
    la1: number;
    lo1: number;
    nx: number;
    ny: number;
    parameterCategory: number;
    parameterNumber: number;
    refTime: string;
  };
}
export type GfsForecastResponse = ForecastEntry[];

const GFS_STEP_ORIGIN = 6; // hours
const GFS_STEP_HORIZON = 1; // hours

// Data is bucketed into groups for every six hours, so we need to find the closest step in the past
function getForecastStartTime(now: Date) {
  // Warning: solar will not be available at horizon 0 so always do at least horizon 1
  let origin = sub(startOfHour(now), { hours: GFS_STEP_HORIZON });
  if (origin.getUTCHours() % GFS_STEP_ORIGIN !== 0) {
    origin = getForecastStartTime(origin);
  }
  return origin;
}

function getBeforeForcastEndTime(now: Date) {
  return add(startOfHour(now), { hours: 0 }).toISOString();
}

function getAfterForecastEndTime(now: Date) {
  return add(startOfHour(now), { hours: GFS_STEP_HORIZON }).toISOString();
}

const targetTimeFunction = {
  before: getBeforeForcastEndTime,
  after: getAfterForecastEndTime,
};

export async function fetchGfsForecast(
  resource: WeatherType,
  startTime: Date,
  endTime: Date,
  period: 'before' | 'after',
  retries = 0
): Promise<GfsForecastResponse> {
  const targetTime = targetTimeFunction[period](endTime);

  const path: URL = new URL(`v8/gfs/${resource}`, getBasePath());
  path.searchParams.append('refTime', startTime.toISOString());
  path.searchParams.append('targetTime', targetTime);

  const requestOptions: RequestInit = {
    method: 'GET',
    headers: await getHeaders(path),
  };
  const response = await fetch(path, requestOptions);
  if (response.ok) {
    const { data } = await response.json();
    return data;
  }

  if (retries >= 3 || response.status !== 404) {
    // TODO: Handle this error gracefully and show message to users that wind layer is not available
    // TODO: Log to Sentry if status is not 404
    throw new Error(
      `Failed to fetch GFS forecast after ${retries} retries (status: ${response.status})`
    );
  }

  // Retry again with a previous step date if request failed with 404
  return fetchGfsForecast(
    resource,
    sub(startTime, { hours: GFS_STEP_ORIGIN }),
    endTime,
    period,
    retries + 1
  );
}

async function getWeatherData(type: WeatherType) {
  const now = new Date();

  const startTime = getForecastStartTime(now);
  const before = fetchGfsForecast(type, startTime, now, 'before');
  const after = fetchGfsForecast(type, startTime, now, 'after');

  const forecasts = await Promise.all([before, after]).then((values) => values);
  const interdata = getInterpolatedData(type, forecasts);
  return interdata;
}

interface UseWeatherQueryOptions
  extends Omit<UseQueryOptions<Maybe<GfsForecastResponse>>, 'queryKey'> {
  type: WeatherType;
}

const useGetWeather = (options: UseWeatherQueryOptions) => {
  const { type, ...queryOptions } = options;
  return useQuery<Maybe<GfsForecastResponse>>({
    queryKey: [type],
    queryFn: () => getWeatherData(type),
    staleTime: FIVE_MINUTES,
    gcTime: FIVE_MINUTES,
    retry: false,
    ...queryOptions,
  });
};

export const useGetWind = (options?: Omit<UseWeatherQueryOptions, 'type'>) =>
  useGetWeather({ type: 'wind', ...options });
export const useGetSolar = (options?: Omit<UseWeatherQueryOptions, 'type'>) =>
  useGetWeather({ type: 'solar', ...options });
```

### 1. 核心模块和依赖
- 使用了`react-query`的`useQuery`钩子管理数据请求的状态。
- `date-fns`库用于时间计算（如获取时间步长、起始时间等）。
- 数据请求是针对NOAA GFS模型数据的，其中支持风和太阳辐射的不同类型。

### 2. 数据结构
- **`WeatherType`**：数据类型，可以是`wind`或`solar`。
- **`ForecastEntry`**：单个预测条目，包含数据（网格数据点的数值）和元数据（如坐标、时间步长、参考时间等）。
- **`GfsForecastResponse`**：整个GFS预测响应的数据结构，包含多个`ForecastEntry`。

### 3. 核心函数解析

#### `getForecastStartTime(now: Date)`
此函数计算**开始时间**，即在当前时间之前最近的6小时的时间步。例如，如果当前时间是10:45，则`getForecastStartTime`返回6:00或12:00等最近的6小时整点。这样保证了获取的预测数据符合GFS的6小时时间步。

#### `fetchGfsForecast`
这是请求GFS预测数据的核心函数：
- **参数**：
  - `resource`：气象数据类型（风或太阳辐射）。
  - `startTime`：预测数据的参考起始时间。
  - `endTime`：结束时间。
  - `period`：预测数据是`before`还是`after`（相对目标时间）。
  - `retries`：重试次数。
- **实现逻辑**：
  1. 计算`targetTime`（目标时间），用于请求数据。
  2. 构造请求路径和参数。
  3. 发送GET请求，获取GFS数据。
  4. 如果返回404错误，表示目标时间的预测数据不可用，则回退到上一个6小时的时间步继续请求，最多重试3次。
  5. 成功后返回数据；若失败，抛出错误。

#### `getWeatherData(type: WeatherType)`
这是一个高层级的函数，用于同时获取指定类型的“before”和“after”数据：
1. 调用`getForecastStartTime`获取最接近的时间步。
2. 使用`fetchGfsForecast`分别请求`before`和`after`的数据。
3. 等待所有数据请求完成后，将结果传入`getInterpolatedData`，进行插值计算，生成最终渲染所需的数据。

#### `useGetWeather`
这是一个自定义Hook，结合`react-query`来管理天气数据的请求和状态：
- **`useQuery`**：调用`getWeatherData`函数，设置缓存时间、垃圾回收时间等配置，以减少对API的频繁调用。

#### `useGetWind` 和 `useGetSolar`
这两个辅助函数分别用于获取风和太阳辐射数据，调用的是`useGetWeather`，并指定了`type`参数来选择天气类型。

### 工作流程概述

1. **确定时间步**：`getForecastStartTime`找到当前时间最接近的6小时时间步。
2. **发起数据请求**：`fetchGfsForecast`根据时间步和数据类型向GFS服务器请求数据，必要时进行重试。
3. **插值处理**：通过`getInterpolatedData`插值计算两个时间步（before和after）间的数据，以获得更接近当前时间的结果。
4. **缓存与管理**：使用`react-query`的`useQuery`管理状态和缓存，减少重复请求。

### 小结
代码逻辑巧妙地结合了时间步计算、数据请求和插值处理，确保能实时、准确地获取气象数据，同时通过`react-query`实现了自动缓存和更新。


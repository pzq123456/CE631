# Simulation procedures

## 1. Discrete Event Simulation From Scratch

我们使用 JavaScript 语言，在现代浏览器中实现了一个简单的离散事件模拟系统。离散事件模拟需要维护一个由事件组成的有序（按时间排序）队列。每次处理队列中的一个事件，然后根据事件的类型和内容，更新系统的状态，并将新的事件加入队列。我们使用了一个简单的 `EventQueue` 类来实现这个功能。

We implemented a simple discrete event simulation system in JavaScript. Discrete event simulation requires maintaining an ordered queue of events (sorted by time). Each time an event is processed from the queue, the system state is updated based on the type and content of the event, and new events are added to the queue. We used a simple `EventQueue` class to implement this functionality.

本文使用二维格网模型来模拟一片可以燃烧的区域，每一个cell包含三种燃烧状态：未燃烧、燃烧中、燃烧完毕。每个cell的燃烧状态会随着时间的推移而改变，cell处于燃烧状态时会向周围的cell传播火焰，传播火焰的行为是否成狗受到蒙特卡洛模拟（风速、风向等）影响。我们实现了[Cell](../project/cell.js)类和[Grid](../project/grid.js)类来管理格网行为并存储格网数据。

We used a two-dimensional grid model to simulate a burnable area, where each cell has three burning states: unburned, burning, and burned out. The burning state of each cell changes over time, and when a cell is burning, it spreads flames to neighboring cells. The behavior of flame propagation is influenced by Monte Carlo simulations (wind speed, wind direction, etc.). We implemented the "Cell" and "Grid" classes to manage grid behavior and store grid data.

![](./imgs/p1.png)
Figure 14: Discrete Event Simulation Structure

接下来具体介绍火焰传播模型。火焰传播模型[FireSpreadEvent](../project/models/fire.js)继承自Event类，是具体描述火焰传播行为的类。该类依赖环境类传入的，真实世界统计得到的概率分布参数，通过蒙特卡洛模拟的方式，模拟环境参量。

Next, we will introduce the fire spread model in detail. The fire spread model "FireSpreadEvent" inherits from the "Event" class and is a specific class that describes the behavior of fire spread. This class depends on the probability distribution parameters obtained from real-world statistics passed in by the environment class and simulates environmental parameters through Monte Carlo simulations.

### 2.1 Environment & Distribution
[Distribution](../project/distributions.js)文件主要用来实现一些概率分布的类及蒙特卡洛模拟方法。

- `MonteCarloDistribution` 提供了统一的分布抽象接口，使得不同分布类具有一致的采样和描述方法。
  - 该类是一个抽象基类，定义了 Monte Carlo 模拟中分布类的基本接口。它不能直接实例化，提供了通用的方法结构，要求继承的子类实现以下两个核心方法：
    - **sample()**：抽象方法，生成符合特定分布的随机样本。子类必须实现该方法，以便生成符合其特定分布的随机数。
    - **describe()**：可选的描述方法，用于输出分布的描述信息。子类可选择实现此方法以返回分布的特征信息。
- `GaussianDistribution` 使用 Box-Muller 变换实现正态分布采样，适用于模拟连续的对称分布场景。
  - 该类继承自 `MonteCarloDistribution`，表示高斯（正态）分布。它采用 Box-Muller 变换生成正态分布随机数。此分布的特点是对称于均值，且样本点主要集中在均值附近。
    - **mean**：均值，控制分布的中心位置。
    - **standardDeviation**：标准差，决定分布的宽度（数据的离散程度）。标准差越大，分布越分散；标准差越小，分布越集中。
- `DiscreteDistribution` 使用累积分布实现离散事件的采样，通过定义不同事件的概率来模拟离散分布场景。
  - 该类同样继承自 `MonteCarloDistribution`，用于表示离散分布。它接收一个概率映射，将一组离散事件与其发生概率关联起来。
    - **_buildCumulative()**：内部方法，用于计算累积分布（cumulative distribution function, CDF）。通过累加每个事件的概率，生成一个累积概率数组，供 `sample()` 方法使用。
    - **sample()**：生成符合离散分布的随机样本。通过生成一个随机数，并与累积分布数组进行比较，返回对应的事件。该方法确保采样过程符合设定的概率分布。
    - **describe()**：返回一个包含事件及其概率的字符串描述，用于快速了解分布特征。

结合上述具体的分布类，我们就可以将其统一在一个环境类下，提供给火焰传播模型使用。[Environment](../project/models/environment.js)类主要用来管理火焰传播模型的环境参数，包括风速、风向等。

"MonteCarloDistribution" provides a unified distribution abstraction interface, allowing different distribution classes to have consistent sampling and description methods. This class is an abstract base class that defines the basic interface of distribution classes in Monte Carlo simulations. It cannot be instantiated directly and provides a common method structure, requiring inheriting subclasses to implement the following two core methods:
    1. "sample()": an abstract method that generates random samples that conform to a specific distribution. Subclasses must implement this method to generate random numbers that conform to their specific distribution.
    2. "describe()": an optional description method used to output distribution information. Subclasses can choose to implement this method to return the characteristics of the distribution.

"GaussianDistribution" uses the Box-Muller transform to sample from a normal distribution, suitable for simulating continuous symmetric distribution scenarios. This class inherits from "MonteCarloDistribution" and represents a Gaussian (normal) distribution. It uses the Box-Muller transform to generate random numbers from a normal distribution. The distribution is symmetric around the mean, and sample points are mainly concentrated near the mean. The "mean" parameter controls the center position of the distribution, while the "standardDeviation" parameter determines the width of the distribution (the degree of data dispersion). The larger the standard deviation, the more dispersed the distribution; the smaller the standard deviation, the more concentrated the distribution.

"DiscreteDistribution" uses a cumulative distribution to sample from discrete events by defining the probabilities of different events to simulate discrete distribution scenarios. This class also inherits from "MonteCarloDistribution" and is used to represent discrete distributions. It accepts a probability mapping that associates a set of discrete events with their occurrence probabilities. The "_buildCumulative()" method is an internal method used to calculate the cumulative distribution function (CDF). By summing the probabilities of each event, it generates a cumulative probability array for the "sample()" method to use. The "sample()" method generates random samples that conform to the discrete distribution. By generating a random number and comparing it with the cumulative distribution array, it returns the corresponding event. This method ensures that the sampling process conforms to the specified probability distribution. The "describe()" method returns a string description containing events and their probabilities for a quick understanding of the distribution characteristics.

### 2.2 FireSpreadEvent
#### `FireSpreadEvent` 类
用于模拟火灾蔓延的事件。核心逻辑包括火势扩散、剩余燃烧时间更新、风力对火势影响的计算。
  
- **execute() 方法**：核心方法，执行火灾扩散逻辑。
  - 获取当前单元格状态，若单元格为“未燃烧”状态，则将其标记为“燃烧中”，并基于风速设定燃烧时间。
  - 遍历相邻单元格，并根据风向和火势扩散概率，判断是否触发火势蔓延。
  - 若当前单元格燃烧时间耗尽，生成 `BurnOutEvent` 事件；否则，继续生成下一时刻的 `FireSpreadEvent` 事件。
- **calculateSpreadProbability() 方法**：计算火势蔓延到邻居单元格的概率，考虑风向和阻燃性。结果缓存以提升效率。
- **forEachNeighbor() 方法**：遍历并处理相邻单元格，用于扩散逻辑。
- **getDirectionFactor() 方法**：计算风向与邻居方向的夹角，以此调整扩散概率。


在 `FireSpreadEvent` 类的火灾扩散模型中，涉及到多个数学公式，主要用于火势蔓延概率的计算以及风向的影响。

"FirespreadEvent" is an event used to simulate the spread of a fire. The core logic includes fire spread, updating the remaining burning time, and calculating the impact of wind on the fire. When the "execute()" method is called, the following steps are performed:1) The current cell state is obtained. If the cell is in an "unburned" state, it is marked as "burning," and the burning time is set based on the wind speed. 2) The neighboring cells are traversed, and based on the wind direction and the probability of fire spread, it is determined whether the fire will spread. 3) If the burning time of the current cell is exhausted, a "BurnOutEvent" is generated; otherwise, the next "FireSpreadEvent" event is generated.

The "calculateSpreadProbability()" method calculates the probability of fire spreading to neighboring cells, considering the wind direction and fire resistance. The results are cached to improve efficiency. The "forEachNeighbor()" method is used to traverse and process neighboring cells for the spread logic. The "getDirectionFactor()" method calculates the angle between the wind direction and the neighboring direction to adjust the spread probability.

#### `BurnOutEvent` 类
`BurnOutEvent`类：这是一个继承自`Event`类的事件，用于表示网格中某个单元格在指定时间点完成燃烧过程并变为“烧毁”状态。它在初始化时接收时间、网格对象，以及目标单元格的坐标（`x`和`y`）。当事件被执行（调用`execute`方法）时，它会将目标单元格的状态更新为`"burned"`，并从网格中移除其“正在燃烧”的状态（通过调用`grid.removeBurningCell`方法），从而完成该单元格的燃烧生命周期管理。

"BurnOutEvent" is an event that inherits from the "Event" class and is used to represent a cell in the grid that has completed the burning process at a specified time and is in the "burned" state. It receives the time, grid object, and the coordinates (x and y) of the target cell as parameters during initialization. When the event is executed (the "execute()" method is called), it updates the state of the target cell to "burned" and removes the "burning" state from the grid (by calling the "grid.removeBurningCell()" method), thereby completing the management of the cell's burning lifecycle.

在火灾模拟系统中，`Firefighter`类承担了模拟消防员行为的核心角色，其职责包括扑灭火灾、铺设隔离带以及根据资源限制制定行动策略。类的设计涵盖属性定义、行为逻辑和网格交互，使其能够动态应对模拟环境中的复杂情况。消防员具备诸如体力、水量、位置、移动方向及目标单元格等属性，结合冻结状态与灭火时间等机制，确保模拟能够以较高的现实性展现消防员的行为。

In the fire simulation system, the "Firefighter" class plays a central role in simulating firefighter behavior. Its responsibilities include extinguishing fires, setting isolation zones, and formulating action strategies based on resource constraints. The class's design covers property definitions, behavioral logic, and grid interactions, allowing it to dynamically respond to complex situations in the simulation environment. Firefighters have attributes such as stamina, water level, position, movement direction, and target cells. Combined with mechanisms such as freezing status and extinguishing time, the class ensures that the simulation can realistically represent firefighter behavior.

在行为设计上，`Firefighter`类通过方法的模块化实现了关键功能。例如，`move`方法允许消防员在网格中移动，并通过目标有效性检查避免无效操作。核心方法`act`则根据消防员当前位置的状态选择相应行为：在燃烧单元格上触发灭火事件；在未燃烧单元格处有概率铺设隔离带；在其他情况下搜索火源并向其移动。这一过程充分考虑了资源消耗与冻结状态的约束，使消防员的行为既智能又受环境影响。为了实现动态互动，类还提供了设置隔离带与向火源移动的功能，模拟消防员在实际任务中的操作方式，例如随机调整路径以避免单一模式的移动。

In terms of behavior design, the "Firefighter" class implements key functions through method modularization. For example, the "move()" method allows firefighters to move in the grid and avoids invalid operations through target validity checks. The core method "act()" selects the corresponding behavior based on the current position of the firefighter: triggering extinguishing events on burning cells; probabilistically setting isolation zones on unburned cells; and searching for the fire source and moving towards it in other cases. This process fully considers resource consumption and freezing status constraints, making firefighter behavior both intelligent and environmentally influenced. To achieve dynamic interaction, the class also provides functions to set isolation zones and move towards the fire source, simulating the operational methods of firefighters in actual tasks, such as randomly adjusting paths to avoid single-mode movement.

`Firefighter`类的功能设计注重细节与现实感。铺设隔离带的操作通过触发事件实现，并消耗一定的体力，强化了资源管理的模拟深度；而移动过程中通过矢量计算并结合随机偏移优化了路径选择。此外，搜索最近燃烧单元格的方法支持筛选特定数量的目标，为消防员的行动策略提供了灵活性。总的来说，消防员的行为可以概括为以下几类：扑灭火灾、设置防火隔离、智能化路径移动，以及水量与体力管理。这些行为使消防员能够在动态环境中完成复杂任务，并通过网格系统的交互增强了模拟的整体表现力。

The "Firefighter" class's functional design focuses on detail and realism. The operation of setting isolation zones is implemented by triggering events and consumes a certain amount of stamina, enhancing the simulation depth of resource management. The path selection is optimized by vector calculation and random offset during movement. In addition, the method of searching for the nearest burning cell supports filtering a specific number of targets, providing flexibility for the firefighter's action strategy. In general, firefighter behavior can be summarized into several categories: extinguishing fires, setting fire isolation zones, intelligent path movement, and water and stamina management. These behaviors enable firefighters to complete complex tasks in a dynamic environment and enhance the overall expressiveness of the simulation through grid system interaction.

设计亮点在于模块化与事件驱动的结合。灭火和隔离带设置事件实现了行为逻辑与环境变化的解耦，提高了代码的扩展性。随机性与策略性行为设计相辅相成，为模拟增添了不确定性与决策挑战。体力和水量的资源消耗模型则提供了更具现实感的约束条件，为模拟决策设计提供依据。此外，灵活的目标选择逻辑为消防员行为的扩展奠定了基础，例如未来可以引入合作灭火或动态优先级调整策略。

The design highlights the combination of modularization and event-driven. The implementation of extinguishing and isolation zone setting events decouples behavior logic from environmental changes, improving code scalability. The complementary design of randomness and strategic behavior adds uncertainty and decision challenges to the simulation. The resource consumption model of stamina and water level provides more realistic constraints and a basis for simulation decision design. In addition, flexible target selection logic lays the foundation for extending firefighter behavior, such as introducing cooperative firefighting or dynamic priority adjustment strategies in the future.



消防员在模拟中遵循多种策略来完成扑灭火灾、阻止火势蔓延和优化自身资源管理的任务。这些策略以消防员的环境感知为基础，通过逻辑判断和目标优化实现。

Firefighters follow multiple strategies in the simulation to extinguish fires, prevent fire spread, and optimize their resource management. These strategies are based on the firefighters' environmental awareness and are implemented through logical reasoning and target optimization.


#### **1. 优先灭火策略 (Prioritize Firefighting)**  
消防员的首要任务是扑灭火灾。当站在燃烧的单元格上时，消防员会触发一系列事件以开始灭火。此过程中，消防员会消耗水量和时间来完成灭火，确保火源被快速控制。如果当前单元格已被其他消防员占据，则消防员会优先移动到其他火源位置。此策略体现了火灾应对的紧迫性。

Firefighters' primary task is to extinguish fires. When standing on a burning cell, firefighters trigger a series of events to start extinguishing the fire. During this process, firefighters consume water and time to complete the extinguishing, ensuring that the fire source is quickly controlled. If the current cell is already occupied by another firefighter, the firefighter will move to another fire source location first. This strategy reflects the urgency of firefighting.

#### **2. 隔离带设置策略 (Establish Firebreaks)**  
如果消防员站在未燃烧的单元格上，并且该位置靠近燃烧区域，有一定概率会铺设隔离带。这一策略通过将单元格标记为不可燃状态来限制火势蔓延，特别适用于火势较大的场景。隔离带的设置依赖于消防员的体力资源，确保在资源允许的情况下最大化防御效果。

If a firefighter is standing on an unburned cell near the burning area, there is a certain probability that they will set up a firebreak. This strategy limits the spread of the fire by marking the cell as non-flammable, especially in large fire scenarios. The establishment of firebreaks depends on the firefighter's stamina resources, ensuring that the defensive effect is maximized within the available resources.

#### **3. 火源导航策略 (Navigate Towards Fire)**  
当消防员不在燃烧单元格上时，他们会搜索最近的火源并向其移动一步。这一策略基于最短路径原则，结合随机偏移以避免路径规划的单调性。消防员还可以在多个目标之间随机选择，确保对火势的全面覆盖。这一策略优化了消防员的行动效率，同时避免了重复移动。

When firefighters are not on a burning cell, they search for the nearest fire source and move towards it. This strategy is based on the shortest path principle, combined with random offsets to avoid the monotony of path planning. Firefighters can also randomly select from multiple targets to ensure comprehensive coverage of the fire. This strategy optimizes the efficiency of firefighter actions while avoiding repeated movements.

#### **4. 资源管理策略 (Resource Management)**  
消防员的行动受到体力和水量的限制。每次移动消耗体力，灭火则同时消耗水量和体力。当资源不足时，消防员会优先选择低消耗行为（如移动），避免浪费有限资源。这一策略确保消防员在行动中的持续性，同时为复杂场景下的补给逻辑提供了接口。

Firefighter actions are limited by stamina and water level. Each movement consumes stamina, while extinguishing fires consumes both water and stamina. When resources are insufficient, firefighters will prioritize low-consumption actions (such as movement) to avoid wasting limited resources. This strategy ensures the continuity of firefighters' actions and provides an interface for supply logic in complex scenarios.

#### **5. 冻结状态策略 (Freeze State Handling)**  
当消防员处于冻结状态（如受外部事件影响）时，他们会停止所有行动。这一策略在逻辑上确保消防员的状态与环境事件联动，同时为模拟中引入更多复杂情境（如中毒、障碍物等）提供了扩展空间。

When firefighters are in a frozen state (e.g., due to external events), they stop all actions. This strategy logically ensures that the firefighters' state is linked to environmental events and provides room for introducing more complex scenarios (such as poisoning, obstacles, etc.) in the simulation.


通过这些策略，消防员能够在动态环境中快速适应变化，平衡灭火与资源管理，并有效限制火灾蔓延。这些行为策略的设计为复杂火灾模拟提供了可靠的基础，同时具备灵活的扩展性。

With these strategies, firefighters can quickly adapt to changes in a dynamic environment, balance firefighting and resource management, and effectively limit the spread of fires. The design of these behavioral strategies provides a reliable foundation for complex fire simulations and has flexible scalability.

未来的改进方向包括优化目标单元格的搜索算法，例如基于欧几里得或曼哈顿距离的距离计算模型，以提升效率与准确性。同时，可以拓展消防员的行为模式，例如通过动态分配优先级实现协作灭火。此外，引入环境因素如风速和地形条件，将进一步丰富消防员的决策复杂性，使模拟更接近现实场景。

Future improvements include optimizing the search algorithm for target cells, such as a distance calculation model based on Euclidean or Manhattan distance, to improve efficiency and accuracy. Additionally, firefighter behavior patterns can be expanded, such as implementing cooperative firefighting through dynamic priority allocation. Furthermore, introducing environmental factors such as wind speed and terrain conditions will further enrich the complexity of firefighter decisions, making the simulation closer to real-world scenarios.

## 


### **阻燃系数 $R$ 的意义**

阻燃系数 $R$ 是火灾传播模型中的重要参数，其反映了邻居单元格对火势蔓延的抑制能力。公式中假定 $P_{\text{spread}} \propto R$，这一设定在常规场景下较为合理，但在极端值（如 $R = 0$ 或 $R = 1$）下可能表现出非物理性。为此，可以设置一个最低传播概率（$P_{\text{spread,min}}$），例如：


$$
P_{\text{spread}} = \max(C \cdot R, P_{\text{spread,min}})
$$
这样即使在高阻燃或低阻燃条件下，也可以避免数值异常并保留火灾的随机性。

### **风速与角度的优化**

风速是火势蔓延的重要驱动力之一，尤其在顺风条件下对火灾的扩展具有显著影响。引入风速因子 $S_{\text{wind}}$（如 $\frac{v_{\text{wind}}}{v_{\text{max}}}$）可以更真实地刻画风速的影响。同时，对于风向角度与邻居单元格的方向差 $\Delta \theta$，应注意其周期性问题。具体公式为：
$$
\Delta \theta = |\theta_{\text{neighbor}} - \theta_{\text{wind}}| \mod 2\pi
$$
这一计算形式确保 $\Delta \theta$ 始终位于 $[0, \pi]$ 范围内，从而避免了因坐标系差异导致的误差。此外，通过调整 $\cos(\Delta \theta)$ 的权重，可以进一步校正风向对火灾传播概率的实际影响。

### **扩展模型的环境因素**

单纯依靠风向和阻燃性并不足以完全模拟火势的复杂传播过程。实际环境中，湿度（$H$）、地形（$T$）以及植被类型等因素同样扮演着重要角色。例如，湿度因子 $H$ 可用来削弱火势蔓延，而地形因子 $T$ 则反映了地形坡度对火灾传播的阻碍。综合上述因素后，火势传播概率的计算公式可以扩展为：
$$
P_{\text{spread}} = C \cdot \cos(\min(\Delta \theta, 2\pi - \Delta \theta)) \cdot S_{\text{wind}} \cdot R \cdot (1 - H) \cdot T
$$
其中，$C$ 是校准系数，用于控制总体传播概率的合理性。通过调整各因子的权重与范围，可以使模型更贴合不同的实际场景。


| 风向 | 角度（弧度） | 角度（度） |
|------|--------------|-----------|
| "N"  | $-\frac{\pi}{2}$ | $-90^\circ$ |
| "NE" | $-\frac{\pi}{4}$ | $-45^\circ$ |
| "E"  | $0$             | $0^\circ$ |
| "SE" | $\frac{\pi}{4}$ | $45^\circ$ |
| "S"  | $\frac{\pi}{2}$ | $90^\circ$ |
| "SW" | $\frac{3\pi}{4}$ | $135^\circ$ |
| "W"  | $\pi$           | $180^\circ$ |
| "NW" | $-\frac{3\pi}{4}$ | $-135^\circ$ |

这种统一的角度定义方式不仅有助于减少计算错误，还能提高模型在复杂环境中的适用性和准确性。通过引入更多环境因素，模型可以更好地反映现实火灾传播的复杂性，为应急管理和火灾预防提供更准确的参考。

公式中的经验系数（如 $0.8$ 或 $C$）通常用于校准火势传播概率，使其符合特定场景的观察数据。然而，这些系数的来源应尽可能依托实际数据分析，而非单纯依赖经验调参。例如，通过与历史火灾数据的对比验证，可以优化这些系数的设定，从而确保模型的普适性和科学性。对于某些特殊场景，还可以根据数据分布调整模型结构，如采用非线性拟合函数取代线性组合形式，以更好地反映火灾传播的复杂特征。
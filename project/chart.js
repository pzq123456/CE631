export function barChart(ctx, labels, datas) {
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datas
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// 雷达图
export function radarChart(ctx, data) {
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
      datasets: [{
        label: 'Wind Direction Distribution',
        data: data,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Wind Direction Distribution'
        }
      }
    }
  });
}

// const DATA_COUNT = 7;
// const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

// const labels = Utils.months({count: 7});
// const data = {
//   labels: labels,
//   datasets: [
//     {
//       label: 'Dataset 1',
//       data: Utils.numbers(NUMBER_CFG),
//       borderColor: Utils.CHART_COLORS.red,
//       backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
//     },
//     {
//       label: 'Dataset 2',
//       data: Utils.numbers(NUMBER_CFG),
//       borderColor: Utils.CHART_COLORS.blue,
//       backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
//     }
//   ]
// };

// const config = {
//   type: 'radar',
//   data: data,
//   options: {
//     responsive: true,
//     plugins: {
//       title: {
//         display: true,
//         text: 'Chart.js Radar Chart'
//       }
//     }
//   },
// };
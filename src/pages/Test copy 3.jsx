import { useEffect } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import data from '../assets/db.json';

const SocialMediaChart = () => {
  useEffect(() => {
    const root = am5.Root.new('chartdiv');
    root.numberFormatter.setAll({
      numberFormat: '#a',
      bigNumberPrefixes: [
        { number: 1e6, suffix: 'M' },
        { number: 1e9, suffix: 'B' },
      ],
      smallNumberPrefixes: [],
    });

    const stepDuration = 2000;
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: 'none',
        wheelY: 'none',
        paddingLeft: 0,
      })
    );

    chart.zoomOutButton.set('forceHidden', true);

    const yRenderer = am5xy.AxisRendererY.new(root, {
      minGridDistance: 20,
      inversed: true,
      minorGridEnabled: true,
    });

    yRenderer.grid.template.set('visible', false);

    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        categoryField: 'network',
        renderer: yRenderer,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0,
        min: 0,
        strictMinMax: true,
        extraMax: 0.1,
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );

    xAxis.set('interpolationDuration', stepDuration / 10);
    xAxis.set('interpolationEasing', am5.ease.linear);

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: 'value',
        categoryYField: 'network',
      })
    );

    series.columns.template.setAll({ cornerRadiusBR: 5, cornerRadiusTR: 5 });

    series.columns.template.adapters.add('fill', function (fill, target) {
      return chart.get('colors').getIndex(series.columns.indexOf(target));
    });

    series.columns.template.adapters.add('stroke', function (stroke, target) {
      return chart.get('colors').getIndex(series.columns.indexOf(target));
    });

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationX: 1,
        sprite: am5.Label.new(root, {
          text: '{valueXWorking.formatNumber("#.# a")}',
          fill: root.interfaceColors.get('alternativeText'),
          centerX: am5.p100,
          centerY: am5.p50,
          populateText: true,
        }),
      });
    });

    const label = chart.plotContainer.children.push(
      am5.Label.new(root, {
        text: '2002',
        fontSize: '8em',
        opacity: 0.2,
        x: am5.p100,
        y: am5.p100,
        centerY: am5.p100,
        centerX: am5.p100,
      })
    );

const transformData = (data) => {
  const result = {};
  data.forEach(item => {
    if (!result[item.year]) {
      result[item.year] = {};
    }
    result[item.year][item.country_name] = item.value;
  });
  
  return result;
};

const allData = transformData(data);

    function getSeriesItem(category) {
      for (let i = 0; i < series.dataItems.length; i++) {
        const dataItem = series.dataItems[i];
        if (dataItem.get('categoryY') === category) {
          return dataItem;
        }
      }
    }

    function sortCategoryAxis() {
      series.dataItems.sort((x, y) => y.get('valueX') - x.get('valueX'));
      am5.array.each(yAxis.dataItems, (dataItem) => {
        const seriesDataItem = getSeriesItem(dataItem.get('category'));
        if (seriesDataItem) {
          const index = series.dataItems.indexOf(seriesDataItem);
          const deltaPosition = (index - dataItem.get('index', 0)) / series.dataItems.length;
          if (dataItem.get('index') !== index) {
            dataItem.set('index', index);
            dataItem.set('deltaPosition', -deltaPosition);
            dataItem.animate({
              key: 'deltaPosition',
              to: 0,
              duration: stepDuration / 2,
              easing: am5.ease.out(am5.ease.cubic),
            });
          }
        }
      });
      yAxis.dataItems.sort((x, y) => x.get('index') - y.get('index'));
    }

    let year = 2002;
    const interval = setInterval(() => {
      year++;
      if (year > 2018) {
        clearInterval(interval);
        clearInterval(sortInterval);
      }
      updateData();
    }, stepDuration);

    const sortInterval = setInterval(sortCategoryAxis, 100);

    function setInitialData() {
      const d = allData[year];
      for (const n in d) {
        series.data.push({ network: n, value: d[n] });
        yAxis.data.push({ network: n });
      }
    }

    function updateData() {
      let itemsWithNonZero = 0;
      if (allData[year]) {
        label.set('text', year.toString());
        am5.array.each(series.dataItems, (dataItem) => {
          const category = dataItem.get('categoryY');
          const value = allData[year][category];
          if (value > 0) {
            itemsWithNonZero++;
          }
          dataItem.animate({
            key: 'valueX',
            to: value,
            duration: stepDuration,
            easing: am5.ease.linear,
          });
          dataItem.animate({
            key: 'valueXWorking',
            to: value,
            duration: stepDuration,
            easing: am5.ease.linear,
          });
        });
        yAxis.zoom(0, itemsWithNonZero / yAxis.dataItems.length);
      }
    }

    setInitialData();
    setTimeout(() => {
      year++;
      updateData();
    }, 50);

    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, []);

  return <div id="chartdiv" className="w-full h-96"></div>;
};

export default SocialMediaChart;

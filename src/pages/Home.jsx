import { useEffect } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import data from '../assets/db_filter.json';

const Home = () => {
  useEffect(() => {
    // สร้าง Chart
    const root = am5.Root.new('chartdiv');

    // กำหนด Format เลขทั้งหลาย M กับ B
    root.numberFormatter.setAll({
      numberFormat: '#a',
      bigNumberPrefixes: [
        { number: 1e6, suffix: 'M' },
        { number: 1e9, suffix: 'B' },
      ],
      smallNumberPrefixes: [],
    });

    // เรียกใช้ธีมจาก am5themes_Animated
    root.setThemes([am5themes_Animated.new(root)]);

    // สร้างแกน X Y
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: 'none',
        wheelY: 'none',
        paddingLeft: 0,
      })
    );

    // เปิด zoom ถ้าข้อมูลเยอะ
    chart.zoomOutButton.set('forceHidden', true);

    const yRenderer = am5xy.AxisRendererY.new(root, {
      minGridDistance: 20,
      inversed: true,
      minorGridEnabled: true,
    });

    // เปิดเส้น grid
    yRenderer.grid.template.set('visible', false);

    // ตั้งค่าแกน Y
    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        categoryField: 'CountryName',
        renderer: yRenderer,
      })
    );

    // ตั้งค่าแกน X
    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0,
        min: 0,
        strictMinMax: true,
        extraMax: 0.1,
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );

    // กำหนดเวลา
    const stepDuration = 2000;
    xAxis.set('interpolationDuration', stepDuration / 10);

    // กำหนดการเคลื่อนไหวแบบ linear
    xAxis.set('interpolationEasing', am5.ease.linear);

    // ยัดค่าแกน X Y (ยัด series)
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: 'value',
        categoryYField: 'CountryName',
      })
    );

    // ปรับ Radius ที่ bar
    series.columns.template.setAll({ cornerRadiusBR: 5, cornerRadiusTR: 5 });

    // ปรับสีใน bar
    series.columns.template.adapters.add('fill', function (fill, target) {
      return chart.get('colors').getIndex(series.columns.indexOf(target));
    });

    // ปรับสีกรอบ stroke ของ bar
    series.columns.template.adapters.add('stroke', function (stroke, target) {
      return chart.get('colors').getIndex(series.columns.indexOf(target));
    });

    // config text ใน bar ที่วิ่งๆ
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

    // config ปีตรงล่างขวา
    const label = chart.plotContainer.children.push(
      am5.Label.new(root, {
        text: '1950',
        fontSize: '8em',
        opacity: 0.2,
        x: am5.p100,
        y: am5.p100,
        centerY: am5.p100,
        centerX: am5.p100,
      })
    );

    // เอา data.json มาแปลง
    const transformData = (data) => {
      const result = {};
      data.forEach(item => {
        if (!result[item.year]) {
          // เอา year มาทำเป็น key
          result[item.year] = {};
        }
        // ใน year จะมี {country_name : value}
        result[item.year][item.country_name] = item.value;
      });

      return result;
    };

    // ค่า allData คือ data.json ที่แปลงแล้ว
    const allData = transformData(data);

    // loop เช็ค transition
    function getSeriesItem(category) {
      for (let i = 0; i < series.dataItems.length; i++) {
        const dataItem = series.dataItems[i];
        if (dataItem.get('categoryY') === category) {
          return dataItem;
        }
      }
    }

    // move-up move-down transition
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

    // ทำซ้ำจนกว่าจะถึงปี 2021
    let year = 1950;
    const interval = setInterval(() => {
      year++;
      if (year > 2021) {
        clearInterval(interval);
        clearInterval(sortInterval);
      }
      updateData();
    }, stepDuration);

    // เคลียร์ตัว transition
    const sortInterval = setInterval(sortCategoryAxis, 100);

    // loop data แกน X Y มาโชว์ (เช็คจาก key = currentYear)
    function setInitialData() {
      const d = allData[year];
      // จะวน loop ผ่านทุกๆ key ใน d
      for (const n in d) {
        // d คือ {country_name : value}
        // n คือ country_name
        series.data.push({ CountryName: n, value: d[n] });
        yAxis.data.push({ CountryName: n });
      }
    }

    // อัปเดตข้อมูลในกราฟเมื่อมีการเปลี่ยนปี (currentYear)
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

    // ใส่ดีเลย์ก่อนอัปเดตข้อมูล 50 มิลลิวินาที
    setTimeout(() => {
      year++;
      updateData();
    }, 50);

    // series(ชุดข้อมูลที่เพิ่มเข้า chart) animation 1วิ 
    series.appear(1000);

    // chart animation 1วิ , delay 100 มิลลิวินาที
    chart.appear(1000, 100);

    // Component ถูก unmounted ให้ dispose ตัว root
    return () => {
      root.dispose();
    };
  }, []);

  return (
    <div className="flex justify-center w-full h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg w-full p-6 mt-6 mx-4 sm:mx-20 h-fit">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          <span className='text-blue-600'> Top Population 🌎</span>
        </h2>
        <div id="chartdiv" className="w-full h-96 mt-4"></div>
      </div>
    </div>
  );
};

export default Home;

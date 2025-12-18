'use client';

import { useLayoutEffect, useRef, useEffect, useMemo } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { formatCurrency, formatPercentage, maskValue } from '../services/intlService';
import ErrorLoadingData from './ErrorLoadingData';
import EmptyState from './EmptyState';
import { getChartColors } from '../services/chartService';
import { BREAKPOINTS } from '@/services/breakpointService';
import { useTailwindBreakpoint } from '@/hooks/useTailwindBreakpoint';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import AllocationChartSkeleton from './AllocationChartSkeleton';

export default function AllocationChart({ isLoading, error, filteredAssetData, showValues, onAddAsset, highlightedAssetId, setHighlightedAssetId, selectedAssetId, setSelectedAssetId }) {

  const { breakpointInPixels } = useTailwindBreakpoint();
  const theme = useSystemTheme();
  const sliceScaleEffect = 1.1;

  const chartColors = getChartColors(theme);
  const isDesktopOrUpper = breakpointInPixels >= BREAKPOINTS.LG;

  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  // Prepare data for AmCharts
  const chartData = useMemo(() => {
    return filteredAssetData.map((asset, index) => ({
      category: asset.description,
      value: asset.valuationInPreferredCurrency,
      id: asset.id,
      fill: chartColors[index % chartColors.length]
    }));
  }, [filteredAssetData, chartColors]);

  useLayoutEffect(() => {
    if (isLoading || error || filteredAssetData.length === 0) return;

    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    let root = am5.Root.new("chartdiv");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    // Define layout based on screen size
    // Desktop: Horizontal (Chart Left, Legend Right)
    // Mobile: Vertical (Chart Top, Legend Bottom)
    root.container.set("layout", isDesktopOrUpper ? root.horizontalLayout : root.verticalLayout);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    let chart = root.container.children.push(am5percent.PieChart.new(root, {
      layout: root.verticalLayout,
      innerRadius: am5.percent(60), // Make it a donut
      width: isDesktopOrUpper ? am5.percent(65) : am5.percent(100), // Give space for legend on desktop
    }));

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    let series = chart.series.push(am5percent.PieSeries.new(root, {
      name: "Series",
      valueField: "value",
      categoryField: "category",
      alignLabels: false
    }));

    seriesRef.current = series;

    // Configure slices
    series.slices.template.setAll({
      stroke: am5.color(theme === 'light' ? '#ffffff' : '#1d232a'),
      strokeWidth: 2,
      scale: 1,
      toggleKey: "none", // Disable toggling on click (we handle it manually for sync)
      cursorOverStyle: "pointer",
      cornerRadius: 5,
      interactive: true
    });

    // Custom colors using the dataContext
    series.slices.template.adapters.add("fill", function (fill, target) {
      if (target.dataItem) {
        return am5.color(target.dataItem.dataContext.fill);
      }
      return fill;
    });

    series.slices.template.adapters.add("stroke", function (stroke, target) {
      return am5.color(theme === 'light' ? '#ffffff' : '#1d232a'); // Border color matching theme bg
    });

    // Tooltip settings
    let tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
      autoTextColor: false,
      pointerOrientation: "horizontal",
    });

    tooltip.get("background").setAll({
      fill: am5.color(theme === 'light' ? '#ffffff' : '#1d232a'), // base-100
      stroke: am5.color(theme === 'light' ? '#e5e7eb' : '#374151'), // base-300
      fillOpacity: 0.9,
      interactive: false
    });

    tooltip.label.setAll({
      fill: am5.color(theme === 'light' ? '#1f2937' : '#e5e7eb'), // base-content
      text: "{category}: {valueFormatted}",
      interactive: false
    });

    series.set("tooltip", tooltip);

    // Format tooltip value
    series.slices.template.adapters.add("tooltipText", function (text, target) {
      if (target.dataItem) {
        const value = target.dataItem.get("value");
        const formattedValue = showValues ? formatCurrency(value) : maskValue(value);
        return `[bold]${target.dataItem.get("category")}[/]\n${formattedValue} (${formatPercentage(target.dataItem.get("valuePercentTotal"), 2)})`;
      }
      return text;
    });

    // Labels - Disabled
    series.labels.template.setAll({
      forceHidden: true
    });

    series.ticks.template.setAll({
      forceHidden: true
    });

    // Set data
    series.data.setAll(chartData);

    // Play initial animation
    // https://www.amcharts.com/docs/v5/concepts/animations/#Component_animations
    series.appear(1000, 100);

    // --- LEGEND CONFIGURATION ---
    if (isDesktopOrUpper) {
      let legend = root.container.children.push(am5.Legend.new(root, {
        centerX: undefined,
        x: undefined,
        layout: root.verticalLayout,
        centerY: am5.percent(50),
        y: am5.percent(50),
        maxHeight: am5.percent(100),
        width: am5.percent(35),
        useDefaultMarker: true,
        verticalScrollbar: am5.Scrollbar.new(root, {
          orientation: "vertical"
        })
      }));

      legend.setAll({
        marginLeft: 20
      });

      // Legend content
      legend.labels.template.setAll({
        fill: am5.color(theme === 'light' ? '#1f2937' : '#e5e7eb'),
        fontSize: 12,
        fontWeight: "500",
      });

      legend.valueLabels.template.setAll({
        fill: am5.color(theme === 'light' ? '#1f2937' : '#e5e7eb'),
        fontSize: 12,
        align: "right",
        text: "{valuePercentTotal.formatNumber('0.00')}%"
      });

      // Make legend interactive
      legend.itemContainers.template.setAll({
        interactive: true,
        cursorOverStyle: "pointer"
      });

      // Legend interaction - State driven
      legend.itemContainers.template.events.on("pointerover", function (e) {
        var item = e.target.dataItem.dataContext;
        if (item && item.dataContext && item.dataContext.id && setHighlightedAssetId) {
          setHighlightedAssetId(item.dataContext.id);
        }
      });

      legend.itemContainers.template.events.on("pointerout", function (e) {
        if (setHighlightedAssetId) {
          setHighlightedAssetId(null);
        }
      });

      // Bind legend to data
      legend.data.setAll(series.dataItems); // Bind immediately as we set data above
    }

    // Slice hover state
    series.slices.template.states.create("hover", {
      scale: sliceScaleEffect
    });

    series.events.on("datavalidated", () => {
      series.slices.each((slice) => {
        slice.events.on("pointerover", () => {
          if (setHighlightedAssetId) {
            setHighlightedAssetId(slice.dataItem.dataContext.id);
          }
        });

        slice.events.on("pointerout", () => {
          if (setHighlightedAssetId) {
            setHighlightedAssetId(null);
          }
        });

        slice.events.on("click", () => {
          if (setSelectedAssetId) {
            const id = slice.dataItem.dataContext.id;
            setSelectedAssetId(prev => prev === id ? null : id);
          }
        });
      });
    });

    chartRef.current = chart;

    return () => {
      root.dispose();
    };
  }, [chartData, isLoading, error, theme, isDesktopOrUpper, showValues, setHighlightedAssetId, setSelectedAssetId]);

  // Handle highlighted and selected states
  useEffect(() => {
    if (!seriesRef.current) return;

    const series = seriesRef.current;
    let isAnyHighlighted = false;

    series.dataItems.forEach((dataItem) => {
      const slice = dataItem.get("slice");
      if (!slice) return;

      const isHighlighted = dataItem.dataContext.id === highlightedAssetId;
      const isSelected = dataItem.dataContext.id === selectedAssetId;

      if (isHighlighted || isSelected) {
        isAnyHighlighted = true;

        // Scale animation
        slice.animate({
          key: "scale",
          to: sliceScaleEffect,
          duration: 300,
          easing: am5.ease.out(am5.ease.cubic)
        });

        // Explode animation (shiftRadius)
        // If selected, shift out. If just highlighted, stay (or shift check?)
        // User said: "Explode that slide from the donut" when clicked (selected).
        const targetShiftRadius = isSelected ? 20 : 0;
        slice.animate({
          key: "shiftRadius",
          to: targetShiftRadius,
          duration: 300,
          easing: am5.ease.out(am5.ease.cubic)
        });

        slice.set("zIndex", 1000); // Bring to front

        if (isHighlighted || isSelected) {
          slice.showTooltip();
        }
      } else {
        slice.animate({
          key: "scale",
          to: 1,
          duration: 300,
          easing: am5.ease.out(am5.ease.cubic)
        });
        slice.animate({
          key: "shiftRadius",
          to: 0,
          duration: 300,
          easing: am5.ease.out(am5.ease.cubic)
        });
        slice.set("zIndex", 0);
        slice.hideTooltip();
      }
    });

    if (!isAnyHighlighted) {
      series.hideTooltip();
    }

  }, [highlightedAssetId, selectedAssetId]);

  // Chart UI based on the state of the component
  if (isLoading) {
    return <AllocationChartSkeleton />;
  }

  if (error) {
    return <ErrorLoadingData error={error} />;
  }

  if (filteredAssetData.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <h2 className="text-lg font-semibold text-center flex items-center justify-center gap-2 sr-only">
          Allocation Chart
        </h2>
        <div className="card-body p-4 lg:p-6 items-center justify-center">
          <EmptyState
            title="Portfolio Allocation"
            description="Once you add assets, you'll see a beautiful visualization of how your portfolio is allocated across different investments."
            onAction={onAddAsset}
            actionLabel="Add assets to get started"
            variant="chart"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl overflow-visible">
      <h2 className="text-lg font-semibold text-center flex items-center justify-center gap-2 sr-only">
        Allocation Chart
      </h2>

      <div className={`card-body p-4 lg:p-6 items-center justify-center ${filteredAssetData.length > 0 ? 'h-[500px] lg:h-[400px]' : ''}`}>
        <div id="chartdiv" style={{ width: "100%", height: "100%" }}></div>
      </div>
    </div>
  );
} 
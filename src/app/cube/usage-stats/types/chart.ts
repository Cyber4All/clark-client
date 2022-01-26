/* eslint-disable @typescript-eslint/ban-types */
type ChartType =
  | 'bar'
  | 'bubble'
  | 'line'
  | 'doughnut'
  | 'radar'
  | 'pie'
  | 'polarArea'
  | 'scatter';

interface ChartFilter {
  label: string;
  options: any[];
}
interface ScaleOptions {
  xAxes?: any;
  yAxes?: any;
}
interface ChartPadding {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}
interface ChartLayout {
  padding: ChartPadding | number;
}

interface ChartLegendOptions {
  display?: boolean;
  position?: 'top' | 'bottom';
}
interface ChartHoverOptions {
  onHover?: Function;
}
interface ChartAnimationOptions {
  onComplete?: Function;
}

interface ChartOptions {
  maintainAspectRatio?: boolean;
  responsive?: boolean;
  scales?: ScaleOptions;
  layout?: ChartLayout;
  legend?: ChartLegendOptions;
  hover?: ChartHoverOptions;
  animation?: ChartAnimationOptions;
}
interface CartesianPoint {
  x: number;
  y: number;
}
interface ChartData {
  data: Array<CartesianPoint | number>;
  label?: string;
}
interface ChartElementOptions {
  backgroundColor?: string | string[];
  borderCapStyle?: string;
  borderColor?: string;
  borderDash?: number[];
  borderDashOffset?: number;
  borderJoinStyle?: string;
  borderWidth?: number;
  cubicInterpolationMode?: number;
  fill?: boolean | string;
  lineTension?: number;
  pointBackgroundColor?: string | string[];
  pointBorderColor?: string | string[];
  pointBorderWidth?: number | number[];
  pointHitRadius?: number | number[];
  pointHoverBackgroundColor?: string | string[];
  pointHoverBorderColor?: string | string[];
  pointHoverBorderWidth?: number | number[];
  pointHoverRadius?: number | number[];
  pointRadius?: number | number[];
  pointRotation?: number | number[];
  pointStyle?: string | string[];
  showLine?: boolean;
  spanGaps?: boolean;
  steppedLine?: boolean;
}
export interface Chart {
  title: string;
  data: Array<ChartData | number>;
  labels: Array<number | string>;
  colors?: ChartElementOptions[];
  type: ChartType;
  options?: ChartOptions;
  legend?: boolean;
  filters?: ChartFilter[];
}

export interface PieChart extends Chart {
  type: 'pie' | 'doughnut';
  data: number[];
}

interface DoughnutChartOptions extends ChartOptions {
  cutoutPercentage?: number;
}
export interface DoughnutChart extends PieChart {
  type: 'doughnut';
  options?: DoughnutChartOptions;
}

import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';

interface Stock {
  name: string;
  subtitle: string;
  value: string;
  trend: 'up' | 'down';
}

interface ChartBar {
  month: string;
  investment: number;
  loss: number;
  profit: number;
  maintenance: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  selectedPeriod: 'month' | 'year' = 'year';

  stocks: Stock[] = [
    { name: 'Bajaj Finery', subtitle: '10% Profit', value: '$1839.00', trend: 'up' },
    { name: 'TTML', subtitle: '10% Loss', value: '$100.00', trend: 'down' },
    { name: 'Reliance', subtitle: '10% Profit', value: '$200.00', trend: 'up' },
    { name: 'ATGL', subtitle: '10% Loss', value: '$189.00', trend: 'down' },
    { name: 'Stolon', subtitle: '10% Profit', value: '$210.00', trend: 'up' },
  ];

  chartData: ChartBar[] = [
    { month: 'Jan', investment: 65, loss: 50, profit: 80, maintenance: 30 },
    { month: 'Feb', investment: 140, loss: 130, profit: 290, maintenance: 100 },
    { month: 'Mar', investment: 55, loss: 40, profit: 50, maintenance: 20 },
    { month: 'Apr', investment: 80, loss: 70, profit: 100, maintenance: 40 },
    { month: 'May', investment: 100, loss: 115, profit: 110, maintenance: 50 },
    { month: 'Jun', investment: 150, loss: 155, profit: 330, maintenance: 80 },
    { month: 'Jul', investment: 120, loss: 130, profit: 230, maintenance: 100 },
    { month: 'Aug', investment: 50, loss: 40, profit: 60, maintenance: 20 },
    { month: 'Sep', investment: 80, loss: 100, profit: 80, maintenance: 40 },
    { month: 'Oct', investment: 90, loss: 110, profit: 180, maintenance: 60 },
    { month: 'Nov', investment: 70, loss: 50, profit: 60, maintenance: 30 },
    { month: 'Dec', investment: 80, loss: 60, profit: 150, maintenance: 30 },
  ];

  readonly maxValue = 400;
  readonly chartHeight = 260;
  readonly barWidth = 12;
  readonly groupGap = 6;
  readonly monthGap = 20;
  readonly paddingLeft = 40;
  readonly paddingBottom = 30;
  readonly colors = {
    investment: '#90CAF9',
    loss: '#42A5F5',
    profit: '#7E57C2',
    maintenance: '#D1C4E9',
  };

  ngAfterViewInit(): void {
    this.drawChart();
  }

  private drawChart(): void {
    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const chartH = h - this.paddingBottom - 20;
    const chartW = w - this.paddingLeft - 10;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    const gridLines = [0, 100, 200, 300, 400];
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#9e9e9e';
    ctx.font = '11px Roboto, sans-serif';
    ctx.textAlign = 'right';

    for (const val of gridLines) {
      const y = 20 + chartH - (val / this.maxValue) * chartH;
      ctx.beginPath();
      ctx.moveTo(this.paddingLeft, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();
      ctx.fillText(String(val), this.paddingLeft - 6, y + 4);
    }

    // Bars
    const totalBarWidth = this.barWidth * 4 + this.groupGap * 3;
    const monthWidth = chartW / this.chartData.length;

    this.chartData.forEach((d, i) => {
      const x = this.paddingLeft + i * monthWidth + (monthWidth - totalBarWidth) / 2;
      const bars = [
        { color: this.colors.investment, value: d.investment },
        { color: this.colors.loss, value: d.loss },
        { color: this.colors.profit, value: d.profit },
        { color: this.colors.maintenance, value: d.maintenance },
      ];

      bars.forEach((bar, j) => {
        const barH = (bar.value / this.maxValue) * chartH;
        const bx = x + j * (this.barWidth + this.groupGap);
        const by = 20 + chartH - barH;

        ctx.fillStyle = bar.color;
        ctx.beginPath();
        const radius = 3;
        ctx.moveTo(bx + radius, by);
        ctx.lineTo(bx + this.barWidth - radius, by);
        ctx.quadraticCurveTo(bx + this.barWidth, by, bx + this.barWidth, by + radius);
        ctx.lineTo(bx + this.barWidth, by + barH);
        ctx.lineTo(bx, by + barH);
        ctx.lineTo(bx, by + radius);
        ctx.quadraticCurveTo(bx, by, bx + radius, by);
        ctx.fill();
      });

      // Month label
      ctx.fillStyle = '#9e9e9e';
      ctx.textAlign = 'center';
      ctx.font = '11px Roboto, sans-serif';
      ctx.fillText(d.month, x + totalBarWidth / 2, h - 6);
    });
  }
}

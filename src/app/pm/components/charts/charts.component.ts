import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Chart, registerables, TooltipItem } from 'chart.js';

@Component({
  selector: 'app-project-stats-chart',
  template: `
    <div class="chart-container">
      <canvas id="projectStatusChart"></canvas>
    </div>
  `,
  styles: [` 
    .chart-container {
      position: relative;
      height: 400px;
      width: 100%;
    }
  `]
})
export class ProjectStatsChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() total: number = 0;
  @Input() active: number = 0;
  @Input() completed: number = 0;
  @Input() behindSchedule: number = 0;
  @Input() highRisk: number = 0;
  
  chart: any;

  ngOnInit() {
    Chart.register(...registerables);
    this.createChart(); // Initialize the chart when the component loads
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['total'] || changes['active'] || changes['completed'] || changes['behindSchedule'] || changes['highRisk']) {
      this.createChart(); // Recreate chart if any input changes
    }
  }

  createChart() {
    const counts = {
      total: this.total,
      active: this.active,
      completed: this.completed,
      behindSchedule: this.behindSchedule,
      highRisk: this.highRisk
    };

    if (this.chart) {
      this.chart.destroy(); // Destroy the old chart before creating a new one
    }

    this.chart = new Chart('projectStatusChart', {
      type: 'bar',
      data: {
        labels: ['Total Projects', 'Active', 'Completed', 'Behind Schedule', 'High Risk'],
        datasets: [{
          label: 'Project Counts',
          data: [
            counts.total, 
            counts.active, 
            counts.completed, 
            counts.behindSchedule, 
            counts.highRisk
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(255, 99, 132, 0.5)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Projects'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Project Status Categories'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<'bar'>) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                const total = (context.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // Manually trigger chart update
  updateChart() {
    this.createChart();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}

import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-task-status-chart',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class TaskStatusChartComponent implements OnChanges, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas: any;
  @Input() taskData: any = {};
  
  public chart?: Chart;
  public chartType: ChartType = 'doughnut';
  private initialized = false;

  ngAfterViewInit(): void {
    this.initialized = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && changes['taskData'] && this.taskData) {
      this.renderChart();
    }
  }

  renderChart() {
    // Ensure canvas is available
    if (!this.chartCanvas?.nativeElement) {
      return;
    }

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration = {
      type: this.chartType,
      data: this.getChartData(),
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed as number;
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  private getChartData(): ChartData {
    return {
      labels: ['To Do', 'In Progress', 'Completed', 'Overdue'],
      datasets: [{
        data: [
          this.taskData.todo || 0,
          this.taskData.inProgress || 0,
          this.taskData.completed || 0,
          this.taskData.overdue || 0
        ],
        backgroundColor: [
          '#FFCE56',  // To Do - yellow
          '#36A2EB',  // In Progress - blue
          '#4BC0C0',  // Completed - teal
          '#FF6384'   // Overdue - red
        ],
        borderWidth: 1
      }]
    };
  }
}
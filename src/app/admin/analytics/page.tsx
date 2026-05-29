'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useChronos } from '../../../context/ChronosContext';

export default function AdminAnalytics() {
  const { employees, timesheets, getWeekDays, currentUser } = useChronos();

  const adminWorkloadChartRef = useRef<HTMLCanvasElement | null>(null);
  const adminRatioChartRef = useRef<HTMLCanvasElement | null>(null);
  const adminDeptChartRef = useRef<HTMLCanvasElement | null>(null);
  const adminProjectChartRef = useRef<HTMLCanvasElement | null>(null);

  const chartsMap = useRef<Record<string, Chart | null>>({
    adminWorkload: null,
    adminRatio: null,
    adminDept: null,
    adminProject: null
  });

  const renderAdminCharts = () => {
    if (!currentUser) return;

    // 1. Team workload line chart
    if (adminWorkloadChartRef.current) {
      if (chartsMap.current.adminWorkload) chartsMap.current.adminWorkload.destroy();
      const weekDates = getWeekDays();
      const workload = weekDates.map((dateStr) => {
        return timesheets
          .filter((t) => t.date === dateStr && t.status !== 'rejected')
          .reduce((sum, t) => sum + t.hours, 0);
      });

      chartsMap.current.adminWorkload = new Chart(adminWorkloadChartRef.current, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Total Hours Worked',
              data: workload,
              fill: true,
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              borderColor: '#6366f1',
              borderWidth: 2,
              tension: 0.3,
              pointBackgroundColor: '#818cf8'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              grid: {
                color: 'rgba(15, 23, 42, 0.06)'
              },
              ticks: {
                color: '#64748b'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#64748b'
              }
            }
          }
        }
      });
    }

    // 2. Approvals Ratio Doughnut Chart
    if (adminRatioChartRef.current) {
      if (chartsMap.current.adminRatio) chartsMap.current.adminRatio.destroy();
      const approved = timesheets.filter((t) => t.status === 'approved').length;
      const pending = timesheets.filter((t) => t.status === 'pending').length;
      const rejected = timesheets.filter((t) => t.status === 'rejected').length;

      chartsMap.current.adminRatio = new Chart(adminRatioChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Approved', 'Pending', 'Rejected'],
          datasets: [
            {
              data: [approved, pending, rejected],
              backgroundColor: [
                'rgba(16, 185, 129, 0.75)',
                'rgba(245, 158, 11, 0.75)',
                'rgba(239, 68, 68, 0.75)'
              ],
              borderColor: '#ffffff',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#64748b',
                font: {
                  size: 11
                }
              }
            }
          },
          cutout: '65%'
        }
      });
    }

    // 3. Dept Horizontal Bars Chart
    if (adminDeptChartRef.current) {
      if (chartsMap.current.adminDept) chartsMap.current.adminDept.destroy();
      const deptHours: Record<string, number> = {
        Engineering: 0,
        Design: 0,
        Marketing: 0,
        Operations: 0
      };
      timesheets
        .filter((t) => t.status === 'approved')
        .forEach((t) => {
          const emp = employees.find((e) => e.id === t.employee_id);
          if (emp && deptHours[emp.department] !== undefined) {
            deptHours[emp.department] += t.hours;
          }
        });

      chartsMap.current.adminDept = new Chart(adminDeptChartRef.current, {
        type: 'bar',
        data: {
          labels: Object.keys(deptHours),
          datasets: [
            {
              label: 'Hours Logged',
              data: Object.values(deptHours),
              backgroundColor: 'rgba(168, 85, 247, 0.75)',
              borderColor: '#c084fc',
              borderWidth: 1,
              borderRadius: 4
            }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(15, 23, 42, 0.06)'
              },
              ticks: {
                color: '#64748b'
              }
            },
            y: {
              grid: {
                display: false
              },
              ticks: {
                color: '#64748b'
              }
            }
          }
        }
      });
    }

    // 4. Project Share Pie Chart
    if (adminProjectChartRef.current) {
      if (chartsMap.current.adminProject) chartsMap.current.adminProject.destroy();
      const projectMap: Record<string, number> = {};
      timesheets
        .filter((t) => t.status === 'approved')
        .forEach((t) => {
          projectMap[t.project] = (projectMap[t.project] || 0) + t.hours;
        });

      const labels = Object.keys(projectMap);
      const data = Object.values(projectMap);
      if (labels.length === 0) {
        labels.push('No project logs');
        data.push(1);
      }

      chartsMap.current.adminProject = new Chart(adminProjectChartRef.current, {
        type: 'pie',
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: [
                'rgba(99, 102, 241, 0.75)',
                'rgba(168, 85, 247, 0.75)',
                'rgba(6, 182, 212, 0.75)',
                'rgba(16, 185, 129, 0.75)'
              ],
              borderColor: '#ffffff',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#64748b',
                font: {
                  size: 11
                }
              }
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    if (timesheets.length > 0 && currentUser) {
      renderAdminCharts();
    }
    return () => {
      if (chartsMap.current.adminWorkload) chartsMap.current.adminWorkload.destroy();
      if (chartsMap.current.adminRatio) chartsMap.current.adminRatio.destroy();
      if (chartsMap.current.adminDept) chartsMap.current.adminDept.destroy();
      if (chartsMap.current.adminProject) chartsMap.current.adminProject.destroy();
    };
  }, [timesheets, employees, currentUser]);

  return (
    <div className="content-view active-view">
      <div className="analytics-grid">
        <div className="chart-card glassmorphism col-8">
          <div className="card-header">
            <h3>Team Weekly Log Summary</h3>
            <p>Total hours logged across the active team</p>
          </div>
          <div className="chart-container">
            <canvas ref={adminWorkloadChartRef} />
          </div>
        </div>

        <div className="chart-card glassmorphism col-4">
          <div className="card-header">
            <h3>Timesheet Approvals Ratio</h3>
            <p>Current percentage of processed actions</p>
          </div>
          <div className="chart-container flex-center">
            <canvas ref={adminRatioChartRef} />
          </div>
        </div>

        <div className="chart-card glassmorphism col-6">
          <div className="card-header">
            <h3>Hours Distribution by Department</h3>
            <p>Aggregated hours across organization departments</p>
          </div>
          <div className="chart-container">
            <canvas ref={adminDeptChartRef} />
          </div>
        </div>

        <div className="chart-card glassmorphism col-6">
          <div className="card-header">
            <h3>Project Time Share</h3>
            <p>Overall time utilization per project</p>
          </div>
          <div className="chart-container">
            <canvas ref={adminProjectChartRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

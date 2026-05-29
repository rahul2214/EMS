'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useChronos } from '../../../context/ChronosContext';

export default function EmployeeAnalytics() {
  const { currentUser, timesheets, getWeekDays } = useChronos();
  
  const empWeeklyChartRef = useRef<HTMLCanvasElement | null>(null);
  const empProjectChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartsMap = useRef<Record<string, Chart | null>>({
    empWeekly: null,
    empProject: null
  });

  const renderEmployeeCharts = () => {
    if (!currentUser) return;
    const empSheets = timesheets.filter(t => t.employee_id === currentUser.id);

    // 1. Weekly hours Chart
    if (empWeeklyChartRef.current) {
      if (chartsMap.current.empWeekly) chartsMap.current.empWeekly.destroy();
      
      const weekDates = getWeekDays();
      const dataset = weekDates.map(dateStr => {
        return empSheets
          .filter(t => t.date === dateStr && t.status !== 'rejected')
          .reduce((sum, t) => sum + t.hours, 0);
      });

      chartsMap.current.empWeekly = new Chart(empWeeklyChartRef.current, {
        type: 'bar',
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [{
            label: 'Hours Logged',
            data: dataset,
            backgroundColor: 'rgba(99, 102, 241, 0.75)',
            borderColor: '#818cf8',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: 'rgba(15, 23, 42, 0.06)' }, ticks: { color: '#64748b' } },
            x: { grid: { display: false }, ticks: { color: '#64748b' } }
          }
        }
      });
    }

    // 2. Project share Doughnut Chart
    if (empProjectChartRef.current) {
      if (chartsMap.current.empProject) chartsMap.current.empProject.destroy();
      
      const approvedTs = empSheets.filter(t => t.status === 'approved');
      const shareMap: Record<string, number> = {};
      approvedTs.forEach(t => {
        shareMap[t.project] = (shareMap[t.project] || 0) + t.hours;
      });

      const labels = Object.keys(shareMap);
      const data = Object.values(shareMap);

      if (labels.length === 0) {
        labels.push("No Approved Hours yet");
        data.push(1);
      }

      chartsMap.current.empProject = new Chart(empProjectChartRef.current, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: ['rgba(99, 102, 241, 0.7)', 'rgba(168, 85, 247, 0.7)', 'rgba(6, 182, 212, 0.7)', 'rgba(16, 185, 129, 0.7)'],
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#64748b', font: { size: 11 } } }
          },
          cutout: '70%'
        }
      });
    }
  };

  useEffect(() => {
    if (timesheets.length > 0 && currentUser) {
      renderEmployeeCharts();
    }
    return () => {
      if (chartsMap.current.empWeekly) chartsMap.current.empWeekly.destroy();
      if (chartsMap.current.empProject) chartsMap.current.empProject.destroy();
    };
  }, [timesheets, currentUser]);

  return (
    <div className="content-view active-view">
      <div className="analytics-row">
        <div className="chart-card glassmorphism">
          <div className="card-header">
            <h3>Weekly Work Distribution</h3>
            <p>Hours logged per day (current week)</p>
          </div>
          <div className="chart-container">
            <canvas ref={empWeeklyChartRef}></canvas>
          </div>
        </div>

        <div className="chart-card glassmorphism">
          <div className="card-header">
            <h3>Time Allocation by Project</h3>
            <p>Total distribution of approved hours</p>
          </div>
          <div className="chart-container">
            <canvas ref={empProjectChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

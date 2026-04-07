import React from 'react';
import ReactECharts from 'echarts-for-react';

const HorizontalBar = () => {
    const option = {
        grid: {
            left: '3%',
            right: '10%',
            bottom: '3%',
            top: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            splitLine: { show: false },
            axisLabel: { show: false },
            axisLine: { show: false }
        },
        yAxis: {
            type: 'category',
            data: ['Billing', 'Technical', 'General', 'Feedback', 'Support'],
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#64748b', fontSize: 12, fontFamily: 'Outfit' }
        },
        series: [
            {
                type: 'bar',
                data: [320, 240, 180, 150, 90],
                itemStyle: {
                    borderRadius: [0, 4, 4, 0],
                    color: '#e0e7ff'
                },
                emphasis: {
                    itemStyle: { color: '#4f46e5' }
                },
                barWidth: 20,
                label: {
                    show: true,
                    position: 'right',
                    color: '#475569',
                    fontSize: 12,
                    fontFamily: 'Outfit',
                    formatter: '{c}',
                    distance: 10
                }
            }
        ]
    };

    return (
        <div className="card h-100 border-0" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="card-body p-4">
                <div className="mb-4">
                    <h5 className="mb-1 fw-bold">Query Classification</h5>
                    <p className="text-muted small mb-0">Distribution across major categories</p>
                </div>
                <div style={{ height: '320px' }}>
                    <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
                </div>
            </div>
        </div>
    );
};

export default HorizontalBar;

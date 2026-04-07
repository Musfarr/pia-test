import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useQuery } from '@tanstack/react-query';
import { getSentimentDaywise } from '../services/api';

const SentimentBar = () => {
    const { data: apiResponse, isLoading } = useQuery({
        queryKey: ['sentimentDaywise'],
        queryFn: () => getSentimentDaywise()
    });

    console.log(apiResponse , "dddddddd")

    if (isLoading) {
        return (
            <div className="card border-0 mb-4 d-flex align-items-center justify-content-center" style={{ borderRadius: 'var(--radius-lg)', height: '300px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const rawData = apiResponse?.data.data || [];
    const dates = rawData.map(item => item.date);
    const sentimentCategories = ['Happy', 'Satisfied', 'Neutral', 'Confused', 'Frustrated', 'Angry', 'Disappointed'];
    
    const sentimentColors = {
        'Happy': '#7cb342',
        'Satisfied': '#9ccc65',
        'Neutral': '#cbd5e1',
        'Confused': '#ffa726',
        'Frustrated': '#ef5350',
        'Angry': '#c62828',
        'Disappointed': '#455a64'
    };

    const series = sentimentCategories.map(category => ({
        name: category,
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: rawData.map(item => item[category] || 0),
        itemStyle: { color: sentimentColors[category] }
    }));

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: '#fff',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            textStyle: { color: '#475569', fontFamily: 'Outfit' },
            padding: [8, 12],
            borderRadius: 8
        },
        legend: {
            data: sentimentCategories,
            textStyle: { color: '#64748b', fontFamily: 'Outfit', fontSize: 12 },
            top: '0%',
            icon: 'circle'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '60px',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: { lineStyle: { color: '#e2e8f0' } },
            axisLabel: { color: '#64748b', fontFamily: 'Outfit' }
        },
        yAxis: {
            type: 'value',
            axisLine: { show: false },
            splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
            axisLabel: { color: '#64748b', fontFamily: 'Outfit' }
        },
        series: series
    };

    return (
        <div className="card border-0 mb-4" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="card-body p-4">
                <div className="mb-4">
                    <h5 className="mb-1 fw-bold">Daily Sentiment Trends</h5>
                    <p className="text-muted small mb-0">Daily emotional breakdown of customer interactions</p>
                </div>
                <div style={{ height: '300px', width: '100%' }}>
                    <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
                </div>
            </div>
        </div>
    );
};

export default SentimentBar;

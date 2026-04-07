import React from 'react';
import ReactECharts from 'echarts-for-react';
import { getCallerOpinions } from '../services/api';
import { useQuery } from '@tanstack/react-query';


const WordBubble = () => {

    const { data : data1, isLoading } = useQuery({
    queryKey: ['callerOpinions'],
    queryFn: () => getCallerOpinions(),
  });


  const bubbledata = data1?.data?.word_cloud;

  
    const data = [
        { itemStyle: { color: '#7cb342' } },
        { itemStyle: { color: '#9ccc65' } },
        { itemStyle: { color: '#212529' } },
        { itemStyle: { color: '#455a64' } },
        { itemStyle: { color: '#c5e1a5' } },
        { itemStyle: { color: '#78909c' } },
        { itemStyle: { color: '#cfd8dc' } },
    ];
    
   
    const transformed = Object.entries(bubbledata || {})?.map(([key , value] , index) => { 
        return {
            name: key.replace(/_/g, ' '),
            value: value,
            symbolSize: value *1.5,
            itemStyle: data[index % data.length].itemStyle
        }
    })    


    // const data2 = data.map((obj ,index) => {
    //         return {
    //             name: bubbledata[index].KEY,
    //             value: bubbledata[index].VALUE,
    //             symbolSize: bubbledata[index].VALUE,
    //             itemStyle: data[index].itemStyle
    //         }
        
    //  })
    

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            show: true,
            formatter: '{b}',
            backgroundColor: '#fff',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            textStyle: { color: '#475569', fontFamily: 'Outfit' }
        },
        series: [
            {
                type: 'graph',
                layout: 'force',
                animation: true,
                data: transformed,
                force: {
                    repulsion: 220,
                    edgeLength: 10,
                    layoutAnimation: true,
                    gravity: 0.1
                },
                label: {
                    show: true,
                    position: 'inside',
                    formatter: '{b}',
                    fontSize: 14,
                    fontWeight: '500',
                    fontFamily: 'Outfit',
                    color: '#fff'
                },
                itemStyle: {
                    shadowBlur: 0,
                    shadowColor: 'transparent',
                    emphasis: {
                        scale: true,
                        focus: 'self'
                    }
                },
                draggable: true
            }
        ]
    };

    return (
        <div className="card h-100 border-0" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div className="card-body p-4">
                <div className="mb-4">
                    <h5 className="mb-1 fw-bold">Caller Trends</h5>
                    <p className="text-muted small mb-0">High-impact topics from recent calls</p>
                </div>
                <div style={{ height: '320px', width: '100%', cursor: 'grab' }}>
                    <ReactECharts
                        option={option}
                        style={{ height: '100%', width: '100%' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default WordBubble;

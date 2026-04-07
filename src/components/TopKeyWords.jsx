import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { getTopKeywords } from '../services/api'



const TopKeyWords = () => {


    const { data: response, isLoading } = useQuery({
        queryKey: ['topKeywords'],
        queryFn: getTopKeywords,
    });

    const data = response?.data?.keyword_cloud || [];

    console.log(data , "data")
  
    if (isLoading) {
        return (
            <div className="card border-0 mb-4 d-flex align-items-center justify-content-center" style={{ borderRadius: 'var(--radius-lg)', minHeight: '300px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="card border-0 mb-4 shadow-sm overflow-scroll" style={{ borderRadius: 'var(--radius-lg)', minHeight: '418px' , maxHeight: '418px' }}>
            <div className="card-body p-4">
                <div className="mb-4">
                    <h5 className="fw-bold">Top Keywords</h5>
                    <p className="text-muted small mb-0">High-impact topics from recent calls</p>
                </div>
                <div className="d-flex flex-wrap gap-3">
                    {Object.entries(data).map(([key, value], index) => (
                        <div
                            key={index}
                            className="p-1 d-flex align-items-center"
                            style={{
                                backgroundColor: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                transition: 'all 0.2s ease',
                                cursor: 'default',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#7cb342';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 179, 66, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                            }}
                        >
                            <div
                                className="px-3 py-2 fw-semibold text-dark"
                                style={{ fontSize: '14px', letterSpacing: '-0.01em' }}
                            >
                                {key.toLowerCase()}
                            </div>
                            <div
                                className="me-1 px-2 py-1 rounded-3 fw-bold"
                                style={{
                                    backgroundColor: '#f1f8e9',
                                    color: '#7cb342',
                                    fontSize: '12px',
                                    minWidth: '32px',
                                    textAlign: 'center'
                                }}
                            >
                                {value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TopKeyWords
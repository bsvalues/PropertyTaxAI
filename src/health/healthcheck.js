async function performHealthCheck() {
  return {
    status: 'healthy',
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      storage: await checkStorage(),
      externalServices: {
        pacs: await checkPACS(),
        gis: await checkGIS()
      },
      metrics: {
        activeUsers: await getActiveUsers(),
        pendingAssessments: await getPendingAssessments(),
        systemLoad: await getSystemLoad()
      }
    }
  };
} 
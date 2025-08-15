# Epic 4: Security, SRE & Observability
## Story 4.8: SLO Definition & Monitoring

**Dependencies:** 
- Epic 4, Story 4.3 (OpenTelemetry) - For metrics collection
- Epic 4, Story 4.5 (Health Checks) - For availability monitoring
- Epic 1, Story 1.2 (User Account System) - For auth journey SLOs
- Epic 1, Story 1.3 (Payment Integration) - For payment SLOs

**Can be implemented:** After core features and observability are in place

*As a product owner, I want SLOs defined and monitored for critical journeys, so that we maintain high service quality.*

### Acceptance Criteria
1. SLOs defined for all critical user journeys
2. SLI metrics collected automatically
3. Error budgets calculated and tracked
4. SLO dashboards visible to entire team
5. Alerts when error budget consumption accelerates
6. Monthly SLO review meetings scheduled

### Development Tasks
- [ ] Define SLOs for each critical journey
- [ ] Implement SLI metric collection
- [ ] Create error budget calculations
- [ ] Build SLO tracking dashboards
- [ ] Configure burn rate alerts
- [ ] Set up weekly/monthly reports
- [ ] Create SLO documentation
- [ ] Implement SLO API endpoints
- [ ] Build error budget policies
- [ ] Create automated SLO reports

### Technical Details

#### SLO Definitions
```typescript
// config/slos.ts
export const SLO_DEFINITIONS = {
  // User Authentication Journey
  authentication: {
    name: 'User Authentication',
    description: 'Login and signup flows',
    slis: {
      availability: {
        target: 99.9, // 99.9% uptime
        measurement: 'successful_requests / total_requests',
      },
      latency: {
        target: 95, // 95% of requests under threshold
        threshold: 1000, // 1 second
        measurement: 'requests_under_1s / total_requests',
      },
    },
    errorBudget: {
      monthly: 43.2, // minutes per month (0.1% of 30 days)
    },
  },
  
  // Payment Processing
  payment: {
    name: 'Payment Processing',
    description: 'Stripe payment and subscription flows',
    slis: {
      availability: {
        target: 99.5, // 99.5% success rate
        measurement: 'successful_payments / total_payments',
      },
      latency: {
        target: 95,
        threshold: 3000, // 3 seconds
        measurement: 'payments_under_3s / total_payments',
      },
    },
    errorBudget: {
      monthly: 216, // minutes per month (0.5% of 30 days)
    },
  },
  
  // Search Functionality
  search: {
    name: 'Program Search',
    description: 'Search and filter operations',
    slis: {
      availability: {
        target: 99.9,
        measurement: 'successful_searches / total_searches',
      },
      latency: {
        target: 95,
        threshold: 500, // 500ms
        measurement: 'searches_under_500ms / total_searches',
      },
    },
    errorBudget: {
      monthly: 43.2,
    },
  },
  
  // Email Delivery
  email: {
    name: 'Email Delivery',
    description: 'Automated email notifications',
    slis: {
      deliveryRate: {
        target: 99.0,
        measurement: 'delivered_emails / sent_emails',
      },
      latency: {
        target: 90,
        threshold: 300000, // 5 minutes
        measurement: 'emails_delivered_under_5m / total_emails',
      },
    },
    errorBudget: {
      monthly: 432, // minutes per month (1% of 30 days)
    },
  },
};
```

#### SLI Collection Service
```typescript
// services/sliCollector.ts
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('slo-monitoring');

// Create metrics for each SLI
const authSuccessCounter = meter.createCounter('auth_success_total');
const authTotalCounter = meter.createCounter('auth_requests_total');
const authLatencyHistogram = meter.createHistogram('auth_latency_ms');

export class SLICollector {
  // Collect authentication metrics
  recordAuthRequest(success: boolean, latencyMs: number, metadata: any) {
    authTotalCounter.add(1, metadata);
    if (success) {
      authSuccessCounter.add(1, metadata);
    }
    authLatencyHistogram.record(latencyMs, metadata);
  }
  
  // Collect payment metrics
  recordPaymentRequest(success: boolean, latencyMs: number, metadata: any) {
    const labels = {
      ...metadata,
      journey: 'payment',
    };
    
    paymentTotalCounter.add(1, labels);
    if (success) {
      paymentSuccessCounter.add(1, labels);
    }
    paymentLatencyHistogram.record(latencyMs, labels);
  }
  
  // Calculate current SLI values
  async calculateSLIs(journey: string, timeRange: TimeRange): Promise<SLIValues> {
    const metrics = await this.queryMetrics(journey, timeRange);
    
    return {
      availability: (metrics.successCount / metrics.totalCount) * 100,
      latency: {
        p50: metrics.latencyP50,
        p95: metrics.latencyP95,
        p99: metrics.latencyP99,
        underThreshold: (metrics.underThresholdCount / metrics.totalCount) * 100,
      },
    };
  }
}
```

#### Error Budget Tracking
```typescript
// services/errorBudget.ts
export class ErrorBudgetTracker {
  async calculateErrorBudget(sloName: string, timeWindow: TimeWindow) {
    const slo = SLO_DEFINITIONS[sloName];
    const currentSLIs = await sliCollector.calculateSLIs(sloName, timeWindow);
    
    // Calculate time-based error budget
    const totalMinutes = timeWindow.duration / 60000; // Convert to minutes
    const allowedDowntime = totalMinutes * (100 - slo.slis.availability.target) / 100;
    
    // Calculate actual downtime
    const actualAvailability = currentSLIs.availability;
    const actualDowntime = totalMinutes * (100 - actualAvailability) / 100;
    
    // Calculate remaining budget
    const consumedBudget = actualDowntime;
    const remainingBudget = allowedDowntime - actualDowntime;
    const burnRate = consumedBudget / allowedDowntime;
    
    return {
      slo: sloName,
      timeWindow,
      budget: {
        total: allowedDowntime,
        consumed: consumedBudget,
        remaining: remainingBudget,
        percentage: (remainingBudget / allowedDowntime) * 100,
      },
      burnRate: {
        current: burnRate,
        sustainable: 1.0, // 100% burn rate over the period
        multiplier: burnRate, // How many times faster than sustainable
      },
      projectedExhaustion: this.projectExhaustion(remainingBudget, burnRate),
    };
  }
  
  private projectExhaustion(remaining: number, burnRate: number): Date | null {
    if (burnRate <= 0) return null;
    
    const minutesUntilExhaustion = remaining / burnRate;
    const exhaustionTime = new Date();
    exhaustionTime.setMinutes(exhaustionTime.getMinutes() + minutesUntilExhaustion);
    
    return exhaustionTime;
  }
}
```

#### Burn Rate Alerts
```typescript
// monitoring/burnRateAlerts.ts
export const BURN_RATE_THRESHOLDS = {
  // Fast burn: Consume monthly budget in 2 days
  critical: {
    rate: 14.4, // 14.4x sustainable rate
    window: '1h',
    action: 'page',
  },
  // Medium burn: Consume monthly budget in 7 days  
  warning: {
    rate: 4.3, // 4.3x sustainable rate
    window: '6h',
    action: 'alert',
  },
  // Slow burn: Consume monthly budget in 14 days
  info: {
    rate: 2.1, // 2.1x sustainable rate
    window: '24h',
    action: 'notify',
  },
};

export async function checkBurnRates() {
  for (const [sloName, slo] of Object.entries(SLO_DEFINITIONS)) {
    const errorBudget = await errorBudgetTracker.calculateErrorBudget(
      sloName,
      { duration: 3600000 } // Last hour
    );
    
    // Check against thresholds
    if (errorBudget.burnRate.current >= BURN_RATE_THRESHOLDS.critical.rate) {
      await alertOncall({
        severity: 'critical',
        slo: sloName,
        burnRate: errorBudget.burnRate.current,
        remainingBudget: errorBudget.budget.percentage,
        projectedExhaustion: errorBudget.projectedExhaustion,
      });
    } else if (errorBudget.burnRate.current >= BURN_RATE_THRESHOLDS.warning.rate) {
      await notifyTeam({
        severity: 'warning',
        slo: sloName,
        burnRate: errorBudget.burnRate.current,
      });
    }
  }
}
```

#### SLO Dashboard API
```typescript
// api/slo/dashboard.ts
export const sloRouter = createTRPCRouter({
  getSLOStatus: publicProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '24h', '7d', '30d']),
    }))
    .query(async ({ input }) => {
      const results = [];
      
      for (const [name, definition] of Object.entries(SLO_DEFINITIONS)) {
        const slis = await sliCollector.calculateSLIs(name, input.timeRange);
        const errorBudget = await errorBudgetTracker.calculateErrorBudget(
          name,
          input.timeRange
        );
        
        results.push({
          name,
          definition,
          current: slis,
          errorBudget,
          status: getSLOStatus(slis, definition),
        });
      }
      
      return results;
    }),
});
```

### Testing Checklist
- [ ] Verify SLI metrics are collected correctly
- [ ] Test error budget calculations
- [ ] Verify burn rate alerts trigger appropriately
- [ ] Test SLO dashboard displays accurate data
- [ ] Verify historical data is retained
- [ ] Test edge cases (100% failure, etc.)
- [ ] Verify performance impact is minimal
- [ ] Test report generation

### Definition of Done
- [ ] SLOs defined for all critical journeys
- [ ] SLI collection implemented
- [ ] Error budget tracking working
- [ ] Burn rate alerts configured
- [ ] SLO dashboard created
- [ ] Automated reports set up
- [ ] Documentation completed
- [ ] Team trained on SLOs
- [ ] Code reviewed and approved
- [ ] Deployed to production

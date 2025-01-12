import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type Event,
  type EventReport,
  AVAILABLE_METRICS,
  getEventsByUser,
  getEventReportByEventId,
} from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AggregatedMetrics {
  [key: string]: {
    total: number;
    count: number;
    average: number;
    label: string;
    type: string;
  };
}

interface MetricSummary {
  label: string;
  totalEvents: number;
  totalValue: number;
  averageValue: number;
  type: string;
}

export function Reports() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [reports, setReports] = useState<EventReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [aggregatedMetrics, setAggregatedMetrics] = useState<AggregatedMetrics>({});
  const [metricSummaries, setMetricSummaries] = useState<MetricSummary[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load all events
        const userEvents = await getEventsByUser(user.uid);
        setEvents(userEvents);

        // Load reports for each event
        const eventReports = await Promise.all(
          userEvents.map(async (event) => {
            const report = await getEventReportByEventId(event.id);
            return report;
          })
        );

        // Filter out null reports
        const validReports = eventReports.filter((report): report is EventReport => report !== null);
        setReports(validReports);

        // Aggregate metrics
        const metrics: AggregatedMetrics = {};

        validReports.forEach((report) => {
          report.metrics.forEach((metric) => {
            const definition = AVAILABLE_METRICS.find(
              def => def.id === metric.definitionId
            );
            if (!definition) return;

            // Initialize metric if not exists
            if (!metrics[metric.definitionId]) {
              metrics[metric.definitionId] = {
                total: 0,
                count: 0,
                average: 0,
                label: definition.label,
                type: definition.type,
              };
            }

            const value = typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value;
            if (!isNaN(Number(value))) {
              metrics[metric.definitionId].total += Number(value);
              metrics[metric.definitionId].count++;
              metrics[metric.definitionId].average = 
                metrics[metric.definitionId].total / metrics[metric.definitionId].count;
            }
          });
        });

        setAggregatedMetrics(metrics);

        // Create metric summaries for visualization
        const summaries = Object.entries(metrics).map(([id, data]) => ({
          label: data.label,
          totalEvents: data.count,
          totalValue: data.total,
          averageValue: data.average,
          type: data.type,
        }));

        setMetricSummaries(summaries);
      } catch (error) {
        console.error('Error loading reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          View aggregated metrics and insights from your events.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Total Events</h3>
              <p className="text-3xl font-bold">{events.length}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Events with Reports</h3>
              <p className="text-3xl font-bold">{reports.length}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Report Completion Rate</h3>
              <p className="text-3xl font-bold">
                {events.length > 0
                  ? Math.round((reports.length / events.length) * 100)
                  : 0}%
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Metric Distribution</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricSummaries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalEvents" fill="#3b82f6" name="Number of Events" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {metricSummaries.map((summary) => (
            <Card key={summary.label} className="p-6">
              <h3 className="text-xl font-semibold mb-4">{summary.label}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Number of Events</p>
                  <p className="text-2xl font-bold">{summary.totalEvents}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-2xl font-bold">
                    {summary.type === 'currency' && '$'}
                    {summary.type === 'rating' 
                      ? summary.totalValue.toFixed(1)
                      : summary.totalValue.toLocaleString()}
                    {summary.type === 'rating' && ' ★'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Value</p>
                  <p className="text-2xl font-bold">
                    {summary.type === 'currency' && '$'}
                    {summary.averageValue.toFixed(
                      summary.type === 'currency' ? 2 : 1
                    )}
                    {summary.type === 'rating' && ' ★'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
} 
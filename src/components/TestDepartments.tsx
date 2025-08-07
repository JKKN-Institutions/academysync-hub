import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDepartments, MyjkknDepartment } from '@/services/myjkknApi';

export const TestDepartments = () => {
  const [departments, setDepartments] = useState<MyjkknDepartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testDepartmentsFetch = async () => {
    setLoading(true);
    setError(null);
    console.log('=== TESTING DEPARTMENTS FETCH ===');
    
    try {
      const result = await fetchDepartments();
      console.log('Departments fetch successful:', result);
      setDepartments(result);
    } catch (err) {
      console.error('Departments fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testDepartmentsFetch();
  }, []);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Department API Test</CardTitle>
        <Button onClick={testDepartmentsFetch} disabled={loading}>
          {loading ? 'Testing...' : 'Test Department Fetch'}
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-600 mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {departments.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Found {departments.length} departments:</h3>
            <div className="space-y-2">
              {departments.map((dept) => (
                <div key={dept.id} className="border p-2 rounded">
                  <div><strong>ID:</strong> {dept.id}</div>
                  <div><strong>Name:</strong> {dept.department_name}</div>
                  <div><strong>Description:</strong> {dept.description}</div>
                  <div><strong>Status:</strong> {dept.status}</div>
                  <div><strong>Institution ID:</strong> {dept.institution_id}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && departments.length === 0 && !error && (
          <div className="text-gray-600">No departments found</div>
        )}
      </CardContent>
    </Card>
  );
};
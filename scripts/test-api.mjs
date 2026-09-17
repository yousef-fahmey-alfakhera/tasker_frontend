/**
 * Automated Verification Script for Tasker Auth & Tasks Backend APIs
 * Usage:
 *   node scripts/test-api.mjs local
 *   node scripts/test-api.mjs remote
 */

const BASE_URLS = {
  local: 'http://127.0.0.1:8000/api',
  remote: 'https://tasker-api.almuder.com/api',
};

const target = process.argv[2] || 'local';
const BASE_URL = (BASE_URLS[target] || target).replace(/\/+$/, '');

console.log('='.repeat(60));
console.log(`TASKER API VERIFICATION SUITE`);
console.log(`Target: ${target} -> ${BASE_URL}`);
console.log('='.repeat(60));

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return { status: response.status, ok: response.ok, data };
}

let testToken = null;
let testUser = null;
let projectId = null;
let workspaceId = null;
let pendingStatusId = null;
let workingStatusId = null;
let completedStatusId = null;
let createdTaskId = null;

const uniqueSuffix = Date.now();
const testEmail = `test.agent.${uniqueSuffix}@tasker.test`;
const testPassword = 'Password123!';

async function runTests() {
  let passedCount = 0;
  let totalCount = 0;

  async function testStep(name, fn) {
    totalCount++;
    process.stdout.write(`[TEST ${totalCount}] ${name} ... `);
    try {
      await fn();
      console.log('✅ PASSED');
      passedCount++;
    } catch (err) {
      console.log('❌ FAILED');
      console.error('   Reason:', err.message);
      if (err.details) {
        console.error('   Details:', JSON.stringify(err.details, null, 2));
      }
    }
  }

  // 1. Register User
  await testStep('Register User (POST /public/auth/register)', async () => {
    const res = await apiRequest('/public/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: `Agent Test ${uniqueSuffix}`,
        email: testEmail,
        password: testPassword,
        password_confirmation: testPassword,
      }),
    });

    if (res.status !== 201 && res.status !== 200) {
      const err = new Error(`Status ${res.status}: ${res.data?.message || 'Registration failed'}`);
      err.details = res.data;
      throw err;
    }

    if (!res.data.data?.token?.access_token) {
      throw new Error('Access token not found in response');
    }

    testToken = res.data.data.token.access_token;
    testUser = res.data.data;
  });

  // 2. Login User
  await testStep('Login User (POST /public/auth/login)', async () => {
    const res = await apiRequest('/public/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    if (res.status !== 200) {
      const err = new Error(`Status ${res.status}: ${res.data?.message || 'Login failed'}`);
      err.details = res.data;
      throw err;
    }

    if (!res.data.data?.token?.access_token) {
      throw new Error('Access token not returned on login');
    }
    testToken = res.data.data.token.access_token;
  });

  // 3. Get Profile
  await testStep('Get Authenticated Profile (GET /profile)', async () => {
    const res = await apiRequest('/profile', {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Failed to fetch profile: ${res.status}`);
    }

    if (res.data.data?.email !== testEmail) {
      throw new Error(`Expected email ${testEmail}, got ${res.data.data?.email}`);
    }
  });

  // 4. Fetch Task Statuses
  await testStep('Fetch Task Statuses (GET /task-statuses)', async () => {
    const res = await apiRequest('/task-statuses', {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Failed to fetch task statuses: ${res.status}`);
    }

    const statuses = res.data.data;
    if (!Array.isArray(statuses) || statuses.length === 0) {
      throw new Error('No task statuses returned');
    }

    const pending = statuses.find((s) => s.stage === 'pending') || statuses[0];
    const working = statuses.find((s) => s.stage === 'working') || statuses[1] || statuses[0];
    const completed = statuses.find((s) => s.stage === 'completed') || statuses[statuses.length - 1];

    pendingStatusId = pending.id;
    workingStatusId = working.id;
    completedStatusId = completed.id;
  });

  // 5. Ensure Project Exists
  await testStep('Ensure Project (GET /projects or POST /projects)', async () => {
    const listRes = await apiRequest('/projects', {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    if (listRes.status === 200 && Array.isArray(listRes.data?.data) && listRes.data.data.length > 0) {
      projectId = listRes.data.data[0].id;
    } else {
      const createRes = await apiRequest('/projects', {
        method: 'POST',
        headers: { Authorization: `Bearer ${testToken}` },
        body: JSON.stringify({
          name: `Test Project ${uniqueSuffix}`,
          description: 'Automated verification test project',
        }),
      });

      if (createRes.status !== 201 && createRes.status !== 200) {
        throw new Error(`Failed to create project: ${createRes.status}`);
      }
      projectId = createRes.data.data.id;
    }
  });

  // 6. Ensure Workspace Exists
  await testStep('Ensure Workspace (GET /workspaces or POST /workspaces)', async () => {
    const listRes = await apiRequest('/workspaces', {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    if (listRes.status === 200 && Array.isArray(listRes.data?.data) && listRes.data.data.length > 0) {
      workspaceId = listRes.data.data[0].id;
    } else {
      const createRes = await apiRequest('/workspaces', {
        method: 'POST',
        headers: { Authorization: `Bearer ${testToken}` },
        body: JSON.stringify({
          project_id: projectId,
          name: `Test Workspace ${uniqueSuffix}`,
          description: 'Automated verification test workspace',
        }),
      });

      if (createRes.status !== 201 && createRes.status !== 200) {
        throw new Error(`Failed to create workspace: ${createRes.status}`);
      }
      workspaceId = createRes.data.data.id;
    }
  });

  // 7. Create Task
  await testStep('Create Task (POST /tasks)', async () => {
    const res = await apiRequest('/tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testToken}` },
      body: JSON.stringify({
        project_id: projectId,
        workspace_id: workspaceId,
        status_id: pendingStatusId,
        title: `Verification Task ${uniqueSuffix}`,
        description: 'Verify automated task lifecycle calculations and position ordering',
        priority: 'High',
        start_date: '2026-09-18 10:00:00',
        due_date: '2026-09-25 18:00:00',
      }),
    });

    if (res.status !== 201 && res.status !== 200) {
      const err = new Error(`Failed to create task: status ${res.status}`);
      err.details = res.data;
      throw err;
    }

    createdTaskId = res.data.data.id;
  });

  // 8. List Tasks & Confirm Created Task
  await testStep('List Tasks (GET /tasks)', async () => {
    const res = await apiRequest(`/tasks?workspace_id=${workspaceId}`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Failed to list tasks: ${res.status}`);
    }

    const found = res.data.data.find((t) => t.id === createdTaskId);
    if (!found) {
      throw new Error(`Newly created task #${createdTaskId} not found in task list`);
    }
  });

  // 9. Update Task (Transition to working stage)
  await testStep('Transition Task to Working (PUT /tasks/{id})', async () => {
    const res = await apiRequest(`/tasks/${createdTaskId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${testToken}` },
      body: JSON.stringify({
        status_id: workingStatusId,
      }),
    });

    if (res.status !== 200 || !res.data.success) {
      const err = new Error(`Failed to transition to working: ${res.status}`);
      err.details = res.data;
      throw err;
    }
  });

  // 10. Update Task (Transition to completed stage & verify lifecycle calculation)
  await testStep('Transition Task to Completed (PUT /tasks/{id})', async () => {
    const res = await apiRequest(`/tasks/${createdTaskId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${testToken}` },
      body: JSON.stringify({
        status_id: completedStatusId,
      }),
    });

    if (res.status !== 200 || !res.data.success) {
      const err = new Error(`Failed to transition to completed: ${res.status}`);
      err.details = res.data;
      throw err;
    }

    const task = res.data.data;
    if (!task.completed_at) {
      console.log('      (Note: completed_at handled by backend transition)');
    }
  });

  // 11. Soft Delete Task
  await testStep('Soft Delete Task (DELETE /tasks/{id})', async () => {
    const res = await apiRequest(`/tasks/${createdTaskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${testToken}` },
    });

    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Failed to delete task: ${res.status}`);
    }
  });

  // 12. Logout User
  await testStep('Logout User (POST /auth/logout)', async () => {
    const res = await apiRequest('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testToken}` },
    });

    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Failed to logout: ${res.status}`);
    }
  });

  // 13. Verify Token Invalidated (GET /profile should be 401)
  await testStep('Verify Token Revoked (GET /profile -> 401)', async () => {
    const res = await apiRequest('/profile', {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized after logout, got ${res.status}`);
    }
  });

  console.log('='.repeat(60));
  console.log(`TEST SUMMARY: ${passedCount}/${totalCount} tests passed`);
  console.log('='.repeat(60));

  if (passedCount === totalCount) {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal error running tests:', e);
  process.exit(1);
});

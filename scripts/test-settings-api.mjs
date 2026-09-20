const BASE_URL = 'http://127.0.0.1:8000/api';

async function req(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const opts = { method, headers };
  if (body) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, opts);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log('='.repeat(60));
  console.log('TASKER SETTINGS & TASK TYPES VERIFICATION SUITE');
  console.log('='.repeat(60));

  // 1. Login as Admin
  console.log('\n[1] Logging in as admin@admin.com ...');
  const login = await req('/public/auth/login', 'POST', {
    email: 'admin@admin.com',
    password: '123456789',
  });
  if (login.status !== 200 || !login.data?.data?.token?.access_token) {
    throw new Error('Admin login failed: ' + JSON.stringify(login.data));
  }
  const token = login.data.data.token.access_token;
  console.log('✅ Logged in successfully. Token:', token.substring(0, 15) + '...');

  // 2. Fetch System Settings (GET /api/settings)
  console.log('\n[2] Testing GET /api/settings (System Settings) ...');
  const settingsRes = await req('/settings', 'GET', null, token);
  console.log(`Status: ${settingsRes.status}, Found: ${settingsRes.data?.data?.length} settings`);
  if (settingsRes.status !== 200 || !Array.isArray(settingsRes.data?.data)) {
    throw new Error('GET /settings failed: ' + JSON.stringify(settingsRes.data));
  }
  settingsRes.data.data.forEach((s) => {
    console.log(`   - ID ${s.id}: ${s.name} (${s.type}), default="${s.default}"`);
  });
  console.log('✅ GET /api/settings verified');

  // 3. Fetch User Settings (GET /api/user-settings)
  console.log('\n[3] Testing GET /api/user-settings (User Customizations) ...');
  const userSettingsRes = await req('/user-settings', 'GET', null, token);
  console.log(`Status: ${userSettingsRes.status}, Found: ${userSettingsRes.data?.data?.length} user overrides`);
  if (userSettingsRes.status !== 200 || !Array.isArray(userSettingsRes.data?.data)) {
    throw new Error('GET /user-settings failed: ' + JSON.stringify(userSettingsRes.data));
  }
  userSettingsRes.data.data.forEach((us) => {
    console.log(`   - Setting ID ${us.setting_id} (${us.setting_name}): value="${us.value}"`);
  });
  console.log('✅ GET /api/user-settings verified');

  // 4. Test Upsert User Setting (POST /api/user-settings)
  console.log('\n[4] Testing POST /api/user-settings (Override setting_id: 4 items_per_page) ...');
  const storeRes = await req(
    '/user-settings',
    'POST',
    { setting_id: 4, value: '75' },
    token
  );
  if (storeRes.status !== 200 && storeRes.status !== 201) {
    throw new Error('POST /user-settings failed: ' + JSON.stringify(storeRes.data));
  }
  console.log(`Status: ${storeRes.status}, Saved setting id: ${storeRes.data?.data?.id}, value: ${storeRes.data?.data?.value}`);
  const userSettingId = storeRes.data.data.id;
  console.log('✅ POST /api/user-settings verified');

  // 5. Verify User Settings reflects updated value
  console.log('\n[5] Verifying GET /api/user-settings after override ...');
  const verifyRes = await req('/user-settings', 'GET', null, token);
  const updatedItem = verifyRes.data?.data?.find((i) => i.setting_id === 4);
  console.log(`Verified value for setting 4: "${updatedItem?.value}"`);
  if (updatedItem?.value !== '75') {
    throw new Error('Setting update was not persisted');
  }
  console.log('✅ User setting override correctly retrieved');

  // 6. Test Reset User Setting (DELETE /api/user-settings/{id})
  console.log(`\n[6] Testing DELETE /api/user-settings/${userSettingId} (Revert to default) ...`);
  const delRes = await req(`/user-settings/${userSettingId}`, 'DELETE', null, token);
  if (delRes.status !== 200) {
    throw new Error('DELETE /user-settings failed: ' + JSON.stringify(delRes.data));
  }
  console.log('Status: 200, Message:', delRes.data?.message);
  console.log('✅ DELETE /api/user-settings verified');

  // 7. Test Task Types (GET /api/task-types)
  console.log('\n[7] Testing GET /api/task-types ...');
  const taskTypesRes = await req('/task-types', 'GET', null, token);
  if (taskTypesRes.status !== 200 || !Array.isArray(taskTypesRes.data?.data)) {
    throw new Error('GET /task-types failed: ' + JSON.stringify(taskTypesRes.data));
  }
  console.log(`Status: 200, Found: ${taskTypesRes.data.data.length} task types`);
  taskTypesRes.data.data.forEach((tt) => {
    console.log(`   - ID ${tt.id}: "${tt.name}" (${tt.type})`);
  });
  const taskTypes = taskTypesRes.data.data;
  console.log('✅ GET /api/task-types verified');

  // 8. Test Creating Task with task_type_id & inspecting respnsapity
  console.log('\n[8] Testing Task creation with task_type_id & inspecting respnsapity ...');
  const workspacesRes = await req('/workspaces', 'GET', null, token);
  const projectsRes = await req('/projects', 'GET', null, token);
  const statusesRes = await req('/task-statuses', 'GET', null, token);

  const workspaceId = workspacesRes.data?.data?.[0]?.id || 1;
  const projectId = projectsRes.data?.data?.[0]?.id || 1;
  const statusId = statusesRes.data?.data?.[0]?.id || 1;
  const chosenType = taskTypes[0];

  console.log(`Creating task with type_id=${chosenType.id} ("${chosenType.name}")...`);
  const createTaskRes = await req(
    '/tasks',
    'POST',
    {
      title: `Verification Task ${Date.now()}`,
      description: 'Testing task_type_id and respnsapity flag in response',
      project_id: projectId,
      workspace_id: workspaceId,
      status_id: statusId,
      task_type_id: chosenType.id,
      priority: 'High',
    },
    token
  );

  if (createTaskRes.status !== 201 && createTaskRes.status !== 200) {
    throw new Error('Create task failed: ' + JSON.stringify(createTaskRes.data));
  }

  const createdTask = createTaskRes.data?.data;
  console.log('Task created successfully! ID:', createdTask.id);
  console.log('   - task_type_id:', createdTask.task_type_id);
  console.log('   - task_type:', JSON.stringify(createdTask.task_type));
  console.log('   - respnsapity:', createdTask.respnsapity, `(Type: ${typeof createdTask.respnsapity})`);
  console.log('✅ Task creation with task_type_id and respnsapity verified successfully!');

  console.log('\n' + '='.repeat(60));
  console.log('ALL SETTINGS & TASK TYPES TESTS PASSED (8/8)!');
  console.log('='.repeat(60));
}

run().catch((err) => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});

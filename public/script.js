let employees = [];
let projects = [];
let months = [];
let selectedMemberIds = [];

document.addEventListener('DOMContentLoaded', () => {
  fetch('/employees').then(r => r.json()).then(data => {
    employees = data;
    renderEmployeeTable();
    buildMemberDatalist();
  });
  fetch('/projects').then(r => r.json()).then(data => {
    projects = data;
    renderProjectTable();
    renderAssignmentTable();
  });

  document.getElementById('add-employee').addEventListener('click', addEmployee);
  document.getElementById('save-employees').addEventListener('click', saveEmployees);
  document.getElementById('project-form').addEventListener('submit', addProject);
  document.getElementById('save-projects').addEventListener('click', saveProjects);

  document.querySelectorAll('input[name="memberMode"]').forEach(radio => {
    radio.addEventListener('change', toggleMemberMode);
  });

  document.getElementById('member-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMemberByInput(e.target.value.trim());
      e.target.value = '';
    }
  });

  generateMonths();
});

function renderEmployeeTable() {
  const tbody = document.querySelector('#employee-table tbody');
  tbody.innerHTML = '';
  employees.forEach((emp, idx) => {
    const tr = document.createElement('tr');
    ['id','name','position','group','type','region','status'].forEach(key => {
      const td = document.createElement('td');
      td.contentEditable = true;
      td.textContent = emp[key];
      td.dataset.key = key;
      tr.appendChild(td);
    });
    const tdOp = document.createElement('td');
    const btnDel = document.createElement('button');
    btnDel.textContent = '削除';
    btnDel.onclick = () => { employees.splice(idx,1); renderEmployeeTable(); };
    tdOp.appendChild(btnDel);
    tr.appendChild(tdOp);
    tbody.appendChild(tr);
  });
}

function renderProjectTable() {
  const tbody = document.querySelector('#project-table tbody');
  tbody.innerHTML = '';
  projects.forEach((proj, idx) => {
    const tr = document.createElement('tr');
    ['customer','content','department','budget','startDate','endDate'].forEach(key => {
      const td = document.createElement('td');
      td.contentEditable = true;
      td.textContent = proj[key];
      td.dataset.key = key;
      tr.appendChild(td);
    });
    const tdMembers = document.createElement('td');
    tdMembers.contentEditable = true;
    tdMembers.textContent = proj.members.join(', ');
    tdMembers.dataset.key = 'members';
    tr.appendChild(tdMembers);
    const tdOp = document.createElement('td');
    const btnDel = document.createElement('button');
    btnDel.textContent = '削除';
    btnDel.onclick = () => { projects.splice(idx,1); renderProjectTable(); renderAssignmentTable(); };
    tdOp.appendChild(btnDel);
    tr.appendChild(tdOp);
    tbody.appendChild(tr);
  });
}

function addEmployee() {
  employees.push({id:'',name:'',position:'',group:'',type:'',region:'',status:''});
  renderEmployeeTable();
}

function saveEmployees() {
  document.querySelectorAll('#employee-table tbody tr').forEach((tr, idx) => {
    const tds = tr.querySelectorAll('td[data-key]');
    tds.forEach(td => {
      employees[idx][td.dataset.key] = td.textContent.trim();
    });
  });
  fetch('/employees',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(employees)});
}

function addProject(e) {
  e.preventDefault();
  const customer = document.getElementById('customer').value.trim();
  const content = document.getElementById('content').value.trim();
  const department = document.getElementById('department').value.trim();
  const budget = document.getElementById('budget').value.trim();
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const mode = document.querySelector('input[name="memberMode"]:checked').value;
  let members = (mode==='smart')?[...selectedMemberIds]:document.getElementById('members-csv').value.split(',').map(s=>s.trim()).filter(Boolean);
  members = [...new Set(members.filter(id=>employees.some(e=>e.id===id)))];
  projects.push({customer,content,department,budget,startDate,endDate,members});
  renderProjectTable();
  renderAssignmentTable();
  document.getElementById('project-form').reset();
  selectedMemberIds=[];
  document.getElementById('chips').innerHTML='';
}

function saveProjects() {
  document.querySelectorAll('#project-table tbody tr').forEach((tr, idx) => {
    const tds = tr.querySelectorAll('td[data-key]');
    tds.forEach(td => {
      if(td.dataset.key==='members'){
        projects[idx].members = td.textContent.split(',').map(s=>s.trim()).filter(Boolean);
      } else {
        projects[idx][td.dataset.key] = td.textContent.trim();
      }
    });
  });
  fetch('/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(projects)});
  renderAssignmentTable();
}

function toggleMemberMode() {
  const mode = document.querySelector('input[name="memberMode"]:checked').value;
  document.getElementById('member-smart').classList.toggle('hidden', mode!=='smart');
  document.getElementById('member-csv').classList.toggle('hidden', mode!=='csv');
}

function buildMemberDatalist() {
  const dl = document.getElementById('employee-options');
  dl.innerHTML='';
  employees.forEach(e=>{
    const opt=document.createElement('option');
    opt.value=`${e.id} ${e.name}`;
    dl.appendChild(opt);
  });
}

function addMemberByInput(v) {
  const parts=v.split(' ');
  const id=parts[0];
  if(employees.some(e=>e.id===id)&&!selectedMemberIds.includes(id)){
    selectedMemberIds.push(id);
    renderChips();
  }
}

function renderChips() {
  const chipsDiv=document.getElementById('chips');
  chipsDiv.innerHTML='';
  selectedMemberIds.forEach(id=>{
    const chip=document.createElement('span');
    chip.className='chip';
    chip.textContent=id;
    const x=document.createElement('button');
    x.textContent='x';
    x.onclick=()=>{selectedMemberIds=selectedMemberIds.filter(m=>m!==id);renderChips();};
    chip.appendChild(x);
    chipsDiv.appendChild(chip);
  });
}

function generateMonths() {
  const now=new Date();
  months=[];
  const start=new Date(now.getFullYear(),now.getMonth()-2,1);
  for(let i=0;i<14;i++){
    const d=new Date(start.getFullYear(),start.getMonth()+i,1);
    months.push(d);
  }
  const headerRow=document.getElementById('assignment-header');
  months.forEach(m=>{
    const th=document.createElement('th');
    th.textContent=`${m.getFullYear()}/${('0'+(m.getMonth()+1)).slice(-2)}`;
    headerRow.appendChild(th);
  });
  const rateTh=document.createElement('th');
  rateTh.textContent='月別稼働率';
  headerRow.appendChild(rateTh);
}

function renderAssignmentTable() {
  const tbody=document.querySelector('#assignment-table tbody');
  tbody.innerHTML='';
  employees.forEach(emp=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${emp.id}</td><td>${emp.name}</td><td>${emp.group}</td><td>${emp.type}</td><td>${emp.region}</td><td>${emp.status}</td>`;
    let activeCount=0;
    months.forEach(m=>{
      let active=false;
      projects.forEach(proj=>{
        if(proj.members.includes(emp.id)){
          const sd=new Date(proj.startDate);
          const ed=new Date(proj.endDate);
          const sdMonth=new Date(sd.getFullYear(),sd.getMonth(),1);
          const edMonth=new Date(ed.getFullYear(),ed.getMonth(),1);
          if(m>=sdMonth&&m<=edMonth){active=true;}
        }
      });
      const td=document.createElement('td');
      td.className=active?'active-month':'inactive-month';
      tr.appendChild(td);
      if(active)activeCount++;
    });
    const rateTd=document.createElement('td');
    rateTd.textContent=((activeCount/months.length)*100).toFixed(1)+'%';
    tr.appendChild(rateTd);
    tbody.appendChild(tr);
  });
}

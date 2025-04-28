document.addEventListener('DOMContentLoaded', () => {
  // — Elements —
  const profileSection       = document.getElementById('profileSection');
  const trackerSection       = document.getElementById('trackerSection');
  const profileList          = document.getElementById('profileList');
  const profileNameEl        = document.getElementById('profileName');
  const backButton           = document.getElementById('backButton');
  const balanceEl            = document.getElementById('balance');
  const amountInput          = document.getElementById('amount');
  const typeSelect           = document.getElementById('type');
  const descriptionSelect    = document.getElementById('descriptionSelect');
  const descriptionCustom    = document.getElementById('descriptionCustom');
  const billAttachment       = document.getElementById('billAttachment');
  const attachmentPreview    = document.getElementById('attachmentPreview');
  const addButton            = document.getElementById('addButton');
  const toggleHistoryBtn     = document.getElementById('toggleHistoryBtn');
  const historyDiv           = document.getElementById('history');
  const historyContent       = document.getElementById('historyContent');
  const filterAllBtn         = document.getElementById('filterAllBtn');
  const filterCreditBtn      = document.getElementById('filterCreditBtn');
  const filterDebitBtn       = document.getElementById('filterDebitBtn');
  const sortBtn              = document.getElementById('sortBtn');
  const profileFab           = document.getElementById('profileFab');
  const profileModal         = document.getElementById('profileModal');
  const addProfileModalBtn   = document.getElementById('addProfileModalBtn');
  const editProfileModalBtn  = document.getElementById('editProfileModalBtn');
  const deleteProfileModalBtn= document.getElementById('deleteProfileModalBtn');
  const recycleBinBtn        = document.getElementById('recycleBinBtn');
  const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
  const customModal          = document.getElementById('customModal');
  const customModalTitle     = document.getElementById('customModalTitle');
  const customModalInput     = document.getElementById('customModalInput');
  const customModalConfirmBtn= document.getElementById('customModalConfirmBtn');
  const customModalCancelBtn = document.getElementById('customModalCancelBtn');
  const recycleBinModal      = document.getElementById('recycleBinModal');
  const recycleList          = document.getElementById('recycleList');
  const closeRecycleModalBtn = document.getElementById('closeRecycleModalBtn');
  const proofModal           = document.getElementById('proofModal');
  const proofImage           = document.getElementById('proofImage');
  const saveProofBtn         = document.getElementById('saveProofBtn');
  const editProofBtn         = document.getElementById('editProofBtn');
  const closeProofModalBtn   = document.getElementById('closeProofModalBtn');
  const confirmModal         = document.getElementById('confirmModal');
  const confirmTitle         = document.getElementById('confirmModalTitle');
  const confirmYesBtn        = document.getElementById('confirmYesBtn');
  const confirmNoBtn         = document.getElementById('confirmNoBtn');

  // — State —
  let profiles        = JSON.parse(localStorage.getItem('profiles')        || '[]');
  let deletedProfiles = JSON.parse(localStorage.getItem('deletedProfiles') || '[]');
  let currentProfile  = null;
  let currentFilter   = 'all';
  let sortNewestFirst = true;
  let proofIndex      = null;

  // — Storage Helpers —
  const saveProfiles = () => localStorage.setItem('profiles', JSON.stringify(profiles));
  const saveDeleted  = () => localStorage.setItem('deletedProfiles', JSON.stringify(deletedProfiles));
  const getTxns      = () => JSON.parse(localStorage.getItem(currentProfile) || '[]');
  const saveTxns     = txns => localStorage.setItem(currentProfile, JSON.stringify(txns));

  // — Toast Notification —
  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  // — Confirmation Modal —
  function showConfirm(message, onConfirm) {
    confirmTitle.textContent = message;
    confirmModal.classList.add('active');
    confirmYesBtn.onclick = () => {
      confirmModal.classList.remove('active');
      onConfirm();
    };
    confirmNoBtn.onclick = () => confirmModal.classList.remove('active');
  }

  // — Section Fade Transition —
  function showSection(from, to) {
    from.classList.add('fade-out');
    from.addEventListener('animationend', () => {
      from.classList.remove('active','fade-out');
      to.classList.add('active','fade-in');
      to.addEventListener('animationend', () => to.classList.remove('fade-in'), { once:true });
    }, { once:true });
  }

  // — Load Profiles List —
  function loadProfiles() {
    profileList.innerHTML = '';
    if (profiles.length === 0) {
      profileList.innerHTML = '<div class="no-data">No profiles. Click + to create one.</div>';
    } else {
      profiles.forEach(name => {
        const el = document.createElement('div');
        el.className = 'profile-item';
        el.textContent = name;
        el.onclick = () => openProfile(name);
        profileList.appendChild(el);
      });
    }
  }

  // — Profile Modal Logic —
  profileFab.onclick = () => profileModal.classList.add('active');
  closeProfileModalBtn.onclick = () => profileModal.classList.remove('active');

  // Add Profile
  addProfileModalBtn.onclick = () => {
    profileModal.classList.remove('active');
    customModalTitle.textContent = 'New Profile Name';
    customModalInput.value = '';
    customModal.classList.add('active');
    customModalConfirmBtn.onclick = () => {
      const nm = customModalInput.value.trim();
      if (!nm) {
        showToast('Name cannot be empty.');
      } else if (profiles.includes(nm)) {
        showToast('Profile already exists.');
      } else {
        showConfirm(`Create profile "${nm}"?`, () => {
          profiles.push(nm);
          saveProfiles(); loadProfiles();
          showToast(`Profile "${nm}" created.`);
        });
      }
      customModal.classList.remove('active');
    };
    customModalCancelBtn.onclick = () => customModal.classList.remove('active');
  };

  // Edit Profile
  editProfileModalBtn.onclick = () => {
    profileModal.classList.remove('active');
    if (!currentProfile) {
      showToast('Please select a profile first.');
      return;
    }
    customModalTitle.textContent = 'Rename Profile';
    customModalInput.value = currentProfile;
    customModal.classList.add('active');
    customModalConfirmBtn.onclick = () => {
      const nm = customModalInput.value.trim();
      if (!nm) {
        showToast('Name cannot be empty.');
      } else if (profiles.includes(nm)) {
        showToast('Profile already exists.');
      } else {
        showConfirm(`Rename profile to "${nm}"?`, () => {
          const idx = profiles.indexOf(currentProfile);
          const data = localStorage.getItem(currentProfile);
          if (data) {
            localStorage.setItem(nm, data);
            localStorage.removeItem(currentProfile);
          }
          profiles[idx] = nm;
          currentProfile = nm;
          profileNameEl.textContent = nm;
          saveProfiles(); loadProfiles();
          showToast(`Profile renamed to "${nm}".`);
        });
      }
      customModal.classList.remove('active');
    };
    customModalCancelBtn.onclick = () => customModal.classList.remove('active');
  };

  // Delete Profile
  deleteProfileModalBtn.onclick = () => {
    profileModal.classList.remove('active');
    if (!currentProfile) {
      showToast('Please select a profile first.');
      return;
    }
    showConfirm(`Delete profile "${currentProfile}"?`, () => {
      profiles = profiles.filter(p => p !== currentProfile);
      deletedProfiles.push(currentProfile);
      saveProfiles(); saveDeleted(); loadProfiles();
      showToast(`Profile "${currentProfile}" deleted.`);
      showSection(trackerSection, profileSection);
      currentProfile = null;
    });
  };

  // Recycle Bin
  recycleBinBtn.onclick = () => {
    profileModal.classList.remove('active');
    recycleBinModal.classList.add('active');
    recycleList.innerHTML = '';
    if (deletedProfiles.length === 0) {
      recycleList.innerHTML = '<div class="no-data">No deleted profiles.</div>';
    } else {
      deletedProfiles.forEach(name => {
        const it = document.createElement('div');
        it.className = 'profile-item';
        it.textContent = name;
        it.onclick = () => {
          showConfirm(`Restore profile "${name}"?`, () => {
            profiles.push(name);
            deletedProfiles = deletedProfiles.filter(p => p !== name);
            saveProfiles(); saveDeleted(); loadProfiles();
            showToast(`Profile "${name}" restored.`);
            recycleBinModal.classList.remove('active');
          });
        };
        recycleList.appendChild(it);
      });
    }
  };
  closeRecycleModalBtn.onclick = () => recycleBinModal.classList.remove('active');

  // Open Profile
  function openProfile(name) {
    currentProfile = name;
    profileNameEl.textContent = name;
    descriptionCustom.classList.add('hidden');
    loadTransactions();
    showSection(profileSection, trackerSection);
  }
  backButton.onclick = () => showSection(trackerSection, profileSection);

  // — Transaction Inputs —
  descriptionSelect.onchange = () => {
    descriptionCustom.classList.toggle('hidden', descriptionSelect.value !== 'Other');
  };
  billAttachment.onchange = () => {
    const f = billAttachment.files[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = () => {
        attachmentPreview.src = reader.result;
        attachmentPreview.classList.remove('hidden');
      };
      reader.readAsDataURL(f);
    }
  };
  function clearInputs() {
    amountInput.value = '';
    typeSelect.value = 'credit';
    descriptionSelect.value = '';
    descriptionCustom.value = '';
    descriptionCustom.classList.add('hidden');
    billAttachment.value = '';
    attachmentPreview.src = '';
    attachmentPreview.classList.add('hidden');
  }

  // Add Transaction
  addButton.onclick = () => {
    const amt = parseFloat(amountInput.value);
    const desc = (descriptionSelect.value === 'Other'
      ? descriptionCustom.value.trim()
      : descriptionSelect.value).trim();
    if (isNaN(amt) || !desc) {
      showToast('Enter amount & description');
      return;
    }
    const txn = {
      amount: typeSelect.value === 'debit' ? -Math.abs(amt) : Math.abs(amt),
      description: desc,
      date: new Date().toLocaleString(),
      timestamp: Date.now(),
      file: null
    };
    const f = billAttachment.files[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = () => {
        txn.file = reader.result;
        saveTransaction(txn);
      };
      reader.readAsDataURL(f);
    } else saveTransaction(txn);
  };
  function saveTransaction(txn) {
    const arr = getTxns();
    arr.push(txn);
    saveTxns(arr);
    clearInputs();
    showToast('Transaction added.');
    loadTransactions();
  }

  // — Balance & History Rendering —
  function renderBalance() {
    const total = getTxns().reduce((s,t)=>s+t.amount,0);
    balanceEl.textContent = `₹${total.toFixed(2)}`;
    balanceEl.className = total>=0?'balance positive':'balance negative';
  }
  function renderHistory() {
    historyContent.innerHTML = '';
    let txns = getTxns().slice();
    txns.sort((a,b)=> sortNewestFirst? b.timestamp-a.timestamp : a.timestamp-b.timestamp);
    txns = txns.filter(t =>
      currentFilter==='all' ||
      (currentFilter==='credit'&&t.amount>0) ||
      (currentFilter==='debit' &&t.amount<0)
    );
    if (txns.length===0) {
      historyContent.innerHTML = '<div class="no-data">No history to show.</div>';
      return;
    }
    txns.forEach((t,i)=>{
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div class="history-row">
          <div class="history-desc">${t.description}</div>
          <div class="history-amount ${t.amount<0?'debit':'credit'}">
            ${t.amount<0?'-':'+'}₹${Math.abs(t.amount).toFixed(2)}
          </div>
        </div>
        <div class="history-row">
          <div class="history-date">${t.date}</div>
          <div>
            ${t.file
              ? `<button class="view-proof-btn btn secondary-btn proof-btn">View Proof</button>`
              : ''}
          </div>
        </div>`;
      historyContent.appendChild(div);
    });
  }
  function loadTransactions() {
    renderBalance();
    renderHistory();
  }

  // Toggle History
  toggleHistoryBtn.onclick = () => {
    const open = historyDiv.classList.toggle('open');
    toggleHistoryBtn.textContent = open?'Hide History':'Show History';
  };

  // Filters & Sort
  filterAllBtn.onclick    = ()=>{ currentFilter='all';    setActiveFilter(); renderHistory(); };
  filterCreditBtn.onclick = ()=>{ currentFilter='credit'; setActiveFilter(); renderHistory(); };
  filterDebitBtn.onclick  = ()=>{ currentFilter='debit';  setActiveFilter(); renderHistory(); };
  function setActiveFilter(){
    filterAllBtn.classList.toggle('active',currentFilter==='all');
    filterCreditBtn.classList.toggle('active',currentFilter==='credit');
    filterDebitBtn.classList.toggle('active',currentFilter==='debit');
  }
  sortBtn.onclick = ()=>{
    sortNewestFirst = !sortNewestFirst;
    sortBtn.textContent = sortNewestFirst?'↓':'↑';
    renderHistory();
  };

  // Proof Modal
  document.body.addEventListener('click', e=>{
    if (e.target.classList.contains('view-proof-btn')) {
      proofIndex = Array.from(historyContent.children).indexOf(e.target.closest('.history-item'));
      proofImage.src = getTxns()[proofIndex].file;
      proofModal.classList.add('active');
    }
  });
  closeProofModalBtn.onclick = () => proofModal.classList.remove('active');
  saveProofBtn.onclick = ()=>{
    const a = document.createElement('a');
    a.href = proofImage.src;
    a.download = `proof_${Date.now()}.png`;
    a.click();
  };
  editProofBtn.onclick = ()=>{
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = ()=>{
      const f = inp.files[0];
      const reader = new FileReader();
      reader.onload = ()=>{
        const arr = getTxns();
        arr[proofIndex].file = reader.result;
        saveTxns(arr);
        proofImage.src = reader.result;
        loadTransactions();
      };
      reader.readAsDataURL(f);
    };
    inp.click();
  };

  // Init
  loadProfiles();
});

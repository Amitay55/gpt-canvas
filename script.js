let changes = [];

let selectMode = false;
let selectedIds = new Set();

const originalText = document.getElementById("original-text");
const editedText = document.getElementById("edited-text");
const changesContainer = document.getElementById("changes-container");
const finalTextElement = document.getElementById("final-text");

function loadData(text1, text2, diffArray) {
  originalText.textContent = text1;
  editedText.textContent = text2;
  changes = diffArray.map((change, index) => ({
    id: index + 1,
    original: change.original,
    edited: change.edited,
    description: change.description,
    approved: null,
    comment: ""
  }));
  renderChanges();
  buildFinalText();
}

function renderChanges() {
  changesContainer.innerHTML = "";

  changes.forEach((change) => {
    const div = document.createElement("div");
    div.className = "change-item";
    div.dataset.id = change.id;

    const desc = document.createElement("p");
    desc.textContent = `🛠️ ${change.description}`;

    const before = document.createElement("p");
    before.innerHTML = `<strong>לפני:</strong> <span class="before">${change.original}</span>`;

    const after = document.createElement("p");
    after.innerHTML = `<strong>אחרי:</strong> <span class="after">${change.edited}</span>`;

    div.appendChild(desc);
    div.appendChild(before);
    div.appendChild(after);

    if (selectMode) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "change-checkbox";
      checkbox.checked = selectedIds.has(change.id);
      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          selectedIds.add(change.id);
          div.classList.add("selected");
        } else {
          selectedIds.delete(change.id);
          div.classList.remove("selected");
        }
      });
      div.insertBefore(checkbox, desc);

      if (selectedIds.has(change.id)) {
        div.classList.add("selected");
      }
    }

    if (change.approved === false && change.comment) {
      const comment = document.createElement("p");
      comment.innerHTML = `<strong>הערת דחייה:</strong> ${change.comment}`;
      div.appendChild(comment);
    }

    changesContainer.appendChild(div);
  });
}

function approveSelected() {
  if (selectMode && selectedIds.size > 0) {
    changes.forEach((c) => {
      if (selectedIds.has(c.id)) c.approved = true;
    });
  } else {
    changes.forEach((c) => (c.approved = true));
  }

  buildFinalText();
  renderChanges();
}

function rejectSelected() {
  const section = document.getElementById("rejection-section");
  const checkboxes = document.getElementById("rejection-checkboxes");
  const textarea = document.getElementById("rejection-comment");

  let targetChanges = [];

  if (selectMode && selectedIds.size > 0) {
    targetChanges = changes.filter((c) => selectedIds.has(c.id));
  } else {
    alert("יש לבחור שינויים לביטול.");
    return;
  }

  section.style.display = "block";
  checkboxes.innerHTML = "";
  textarea.value = "";

  targetChanges.forEach((change) => {
    const row = document.createElement("div");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.value = change.id;
    box.checked = true;

    const label = document.createElement("label");
    label.textContent = `❌ ${change.description}`;

    row.appendChild(box);
    row.appendChild(label);
    checkboxes.appendChild(row);
  });

  document.getElementById("submit-rejection").onclick = () => {
    const comment = textarea.value.trim();
    const selected = [...checkboxes.querySelectorAll("input:checked")].map((c) => parseInt(c.value));

    changes.forEach((c) => {
      if (selected.includes(c.id)) {
        c.approved = false;
        c.comment = comment;
      }
    });

    section.style.display = "none";
    buildFinalText();
    renderChanges();
  };
}

function buildFinalText() {
  let result = originalText.textContent;

  changes.forEach((c) => {
    if (c.approved === true) {
      result = result.replace(c.original, c.edited);
    }
  });

  finalTextElement.textContent = result;
}

function toggleSelectMode() {
  selectMode = !selectMode;
  if (!selectMode) selectedIds.clear();

  const toggleBtn = document.getElementById("toggle-select-mode");
  toggleBtn.classList.toggle("active", selectMode);

  renderChanges();
}

document.getElementById("toggle-select-mode").addEventListener("click", toggleSelectMode);
document.getElementById("approve-button").addEventListener("click", approveSelected);
document.getElementById("reject-button").addEventListener("click", rejectSelected);

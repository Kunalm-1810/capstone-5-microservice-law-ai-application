function searchLaw() {
  let query = document.getElementById("searchInput").value.toLowerCase();
  let result = document.getElementById("result");

  if (query.includes("fir")) {
    result.innerHTML = `
      <h3>What is FIR?</h3>
      <p>FIR (First Information Report) is a written document prepared by police when they receive information about a cognizable offence.</p>
    `;
  } else if (query.includes("arrest")) {
    result.innerHTML = `
      <h3>Rights During Arrest</h3>
      <p>You have the right to remain silent, right to a lawyer, and must be informed of the reason for arrest.</p>
    `;
  } else {
    result.innerHTML = `<p>No results found. Try something else.</p>`;
  }
}

function showSection(section) {
  let content = document.getElementById("content");

  if (section === "rights") {
    content.innerHTML = `
      <h2>Fundamental Rights</h2>
      <ul>
        <li>Right to Equality</li>
        <li>Right to Freedom</li>
        <li>Right Against Exploitation</li>
      </ul>
    `;
  }

  if (section === "criminal") {
    content.innerHTML = `
      <h2>Criminal Law</h2>
      <p>Includes IPC, CrPC, and laws related to crimes and punishment.</p>
    `;
  }

  if (section === "consumer") {
    content.innerHTML = `
      <h2>Consumer Rights</h2>
      <p>You can file complaints in consumer court for defective products or services.</p>
    `;
  }

  if (section === "guides") {
    content.innerHTML = `
      <h2>Legal Guides</h2>
      <p>How to file FIR:</p>
      <ol>
        <li>Go to nearest police station</li>
        <li>Provide details of incident</li>
        <li>Get FIR copy</li>
      </ol>
    `;
  }
}
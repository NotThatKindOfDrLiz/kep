const relayUrl = "wss://relay.nostr.band"; // You can add more later
const relay = window.NostrTools.relayInit(relayUrl);
const agendaTag = "agenda";

let privKey, pubKey;

async function connectRelay() {
  await relay.connect();
  console.log(`Connected to ${relayUrl}`);

  privKey = window.NostrTools.generatePrivateKey();
  pubKey = window.NostrTools.getPublicKey(privKey);

  fetchAgendaItems();
}

async function fetchAgendaItems() {
  const sub = relay.sub([
    {
      kinds: [1],
      "#t": [agendaTag],
      limit: 20
    }
  ]);

  const container = document.getElementById("agenda-list");
  container.innerHTML = "";

  sub.on("event", (event) => {
    const content = event.content;
    const from = event.tags.find(tag => tag[0] === "p")?.[1] || "Anonymous";
    const when = new Date(event.created_at * 1000).toLocaleString();

    const div = document.createElement("div");
    div.className = "agenda-item";
    div.innerHTML = `<p>${content}</p><div class="meta">From: ${from} • ${when}</div>`;
    container.appendChild(div);
  });
}

async function submitAgendaItem(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const agenda = document.getElementById("agenda").value.trim();
  if (!agenda) return;

  const event = {
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["t", agendaTag]],
    content: agenda,
    pubkey: pubKey,
  };

  if (name) {
    event.tags.push(["p", name]);
  }

  event.id = window.NostrTools.getEventHash(event);
  event.sig = window.NostrTools.signEvent(event, privKey);

  try {
    await relay.publish(event);
    document.getElementById("agenda").value = "";
    alert("Agenda submitted!");
    fetchAgendaItems(); // Refresh the feed
  } catch (err) {
    console.error("Failed to publish:", err);
    alert("Failed to submit agenda item.");
  }
}

document.getElementById("agenda-form").addEventListener("submit", submitAgendaItem);
connectRelay();

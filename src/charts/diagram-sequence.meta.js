module.exports = {
  title: 'Sequence diagram',
  group: 'Diagrams',
  dataFormat: `Plain text, one statement per line, inside an inline <code>&lt;script type="text/plain"&gt;</code> (or <code>data-spark-data</code>, or a <code>&lt;pre&gt;</code> that stays readable without JS).
<code>Client -&gt; API: GET /me</code> solid sync · <code>API --&gt; Client: 401</code> dashed return · <code>Client -&gt;&gt; Queue: enqueue</code> async open arrow (<code>-&gt;+</code> / <code>--&gt;-</code> activate / deactivate).
<code>note over API: text</code> / <code>note left of A</code> / <code>note right of A</code> / <code>note over A,B</code> · <code>loop</code> <code>alt</code> <code>opt</code> <code>par</code> … <code>else</code> … <code>end</code> frames (nestable) · <code>participant API as "Gateway"</code> · <code>activate X</code> / <code>deactivate X</code> · <code>autonumber</code> · <code>title</code>.
Participants appear in order of first mention. JSON works too: <code>{"participants":["A","B"],"messages":[{"from":"A","to":"B","text":"hi","kind":"sync|return|async"},{"note":"x","over":"B"},{"frame":"loop","label":"retry"},{"end":true}]}</code>. Update with <code>spark:data</code> (text or object).`,
  summary: 'Draws a UML sequence diagram from a few lines of text: lifelines, sync / return / async arrows, self-messages, notes, loop / alt / opt frames and activation bars. Hover a message to light it and its participants; arrow keys step through messages; <code>data-spark-play</code> draws it in as you scroll. A screen-reader list narrates every step.',
  classes: [['spark-diagram-sequence', 'Container; the text lives in an inline script (or data-spark-data).']],
  options: [
    ['data-spark-data', '', 'The diagram text or JSON (otherwise read from the inline <script type="text/plain"> / <pre>).'],
    ['data-spark-play', 'false', 'Draw messages in one by one when scrolled into view (static for reduced motion).'],
    ['data-spark-step', '420', 'Play: ms between messages.'],
    ['data-spark-activations', 'false', 'Automatic activation bars: a sync/async message activates its target until it returns.'],
    ['data-spark-numbers', 'false', 'Number the messages (or write <code>autonumber</code>).'],
    ['data-spark-bottom', 'false', 'Repeat participant boxes at the bottom.'],
    ['data-spark-gap', '0', 'Minimum px between lifelines (0 = auto).'],
    ['data-spark-colors', 'Shine tones', 'Participant accent colors.'],
    ['data-spark-tooltip', 'true', 'Keyboard-step tooltip.'],
    ['data-spark-title', '', 'Accessible name.'],
  ],
  vars: [
    ['--spark-seq-line', 'muted text', 'Arrow color.'],
    ['--spark-seq-note', 'tinted warning', 'Note fill.'],
  ],
  events: [
    ['spark:select', 'Message clicked. detail = { index, label, from, to }.'],
    ['spark:data (listen)', 'Dispatch with detail = new text or JSON to redraw.'],
  ],
  examples: [
    { html: `<div class="card p-6 spark-diagram-sequence" data-spark-title="Token refresh" data-spark-bottom><script type="text/plain">
participant Client
participant API as "API Gateway"
participant Auth
Client -> API: GET /me
API --> Client: 401 Unauthorized
note over Client: token expired
loop retry up to 3x
  Client ->> Auth: POST /refresh
  alt valid refresh token
    Auth --> Client: new access token
  else revoked
    Auth --> Client: 403
  end
end
Client -> API: GET /me
API -> API: verify JWT
API --> Client: 200 OK
</script></div>`, label: 'Auth flow with frames' },
    { html: `<div class="card p-6 spark-diagram-sequence" data-spark-play data-spark-activations data-spark-numbers><script type="text/plain">
Browser ->> Server: submit order
Server -> DB: INSERT order
DB --> Server: id 42
Server ->> Mailer: send receipt
note right of Mailer: queued
Server --> Browser: 201 Created
</script></div>`, label: 'Play mode with activations (scroll in)' },
  ],
};

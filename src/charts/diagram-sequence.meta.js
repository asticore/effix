module.exports = {
  title: 'Sequence diagram',
  group: 'Diagrams',
  dataFormat: `Plain text, one statement per line, inside an inline <code>&lt;script type="text/plain"&gt;</code> (or <code>data-efx-data</code>, or a <code>&lt;pre&gt;</code> that stays readable without JS).
<code>Client -&gt; API: GET /me</code> solid sync · <code>API --&gt; Client: 401</code> dashed return · <code>Client -&gt;&gt; Queue: enqueue</code> async open arrow (<code>-&gt;+</code> / <code>--&gt;-</code> activate / deactivate).
<code>note over API: text</code> / <code>note left of A</code> / <code>note right of A</code> / <code>note over A,B</code> · <code>loop</code> <code>alt</code> <code>opt</code> <code>par</code> … <code>else</code> … <code>end</code> frames (nestable) · <code>participant API as "Gateway"</code> · <code>activate X</code> / <code>deactivate X</code> · <code>autonumber</code> · <code>title</code>.
Participants appear in order of first mention. JSON works too: <code>{"participants":["A","B"],"messages":[{"from":"A","to":"B","text":"hi","kind":"sync|return|async"},{"note":"x","over":"B"},{"frame":"loop","label":"retry"},{"end":true}]}</code>. Update with <code>efx:data</code> (text or object).`,
  summary: 'Draws a UML sequence diagram from a few lines of text: lifelines, sync / return / async arrows, self-messages, notes, loop / alt / opt frames and activation bars. Hover a message to light it and its participants; arrow keys step through messages; <code>data-efx-play</code> draws it in as you scroll. A screen-reader list narrates every step.',
  classes: [['efx-diagram-sequence', 'Container; the text lives in an inline script (or data-efx-data).']],
  options: [
    ['data-efx-data', '', 'The diagram text or JSON (otherwise read from the inline <script type="text/plain"> / <pre>).'],
    ['data-efx-play', 'false', 'Draw messages in one by one when scrolled into view (static for reduced motion).'],
    ['data-efx-step', '420', 'Play: ms between messages.'],
    ['data-efx-activations', 'false', 'Automatic activation bars: a sync/async message activates its target until it returns.'],
    ['data-efx-numbers', 'false', 'Number the messages (or write <code>autonumber</code>).'],
    ['data-efx-bottom', 'false', 'Repeat participant boxes at the bottom.'],
    ['data-efx-gap', '0', 'Minimum px between lifelines (0 = auto).'],
    ['data-efx-colors', 'Shine tones', 'Participant accent colors.'],
    ['data-efx-tooltip', 'true', 'Keyboard-step tooltip.'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [
    ['--efx-seq-line', 'muted text', 'Arrow color.'],
    ['--efx-seq-note', 'tinted warning', 'Note fill.'],
  ],
  events: [
    ['efx:select', 'Message clicked. detail = { index, label, from, to }.'],
    ['efx:data (listen)', 'Dispatch with detail = new text or JSON to redraw.'],
  ],
  examples: [
    { html: `<div class="card p-6 efx-diagram-sequence" data-efx-title="Token refresh" data-efx-bottom><script type="text/plain">
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
    { html: `<div class="card p-6 efx-diagram-sequence" data-efx-play data-efx-activations data-efx-numbers><script type="text/plain">
Browser ->> Server: submit order
Server -> DB: INSERT order
DB --> Server: id 42
Server ->> Mailer: send receipt
note right of Mailer: queued
Server --> Browser: 201 Created
</script></div>`, label: 'Play mode with activations (scroll in)' },
  ],
};

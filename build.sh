#!/bin/sh
# 把 src/ 里的分段拼成单文件 index.html，并检查故事的每一条路
set -e
cd "$(dirname "$0")"
cat src/s1_story.js src/s2_story.js src/s3_story.js src/s4_end.js > src/core.js
for f in src/core.js src/d_art.js src/e_ui.js; do node --check "$f"; done
{ cat src/a_head.html src/b_body.html; echo '<script>'; cat src/core.js; echo '</script>'; echo '<script>'; cat src/d_art.js src/e_ui.js; echo '</script>'; echo '</body>'; echo '</html>'; } > index.html
echo "built index.html ($(wc -c < index.html | tr -d ' ') bytes)"

import argparse
import os
from pathlib import Path
import re
import subprocess
import sys

parser = argparse.ArgumentParser()
parser.add_argument('slugs', nargs='+')
args = parser.parse_args()
failed = 0
executed = 0
environment = dict(os.environ, MPLBACKEND='Agg', PYTHONIOENCODING='utf-8')
print(sys.version)
for slug in args.slugs:
    if not re.fullmatch(r'[a-z0-9-]+', slug):
        raise ValueError('Invalid lesson slug')
    text = Path('content/lessons', slug + '.md').read_text('utf-8')
    for number, match in enumerate(re.finditer(r'```python\s*\n(.*?)```', text, re.S), 1):
        executed += 1
        try:
            result = subprocess.run([sys.executable, '-c', match[1]], capture_output=True,
                                    text=True, encoding='utf-8', env=environment, timeout=120)
            expected = re.match(r'\s*Kết quả kỳ vọng[^\n`]*`([^`]+)`', text[match.end():])
            mismatch = expected is not None and result.stdout.strip() != expected[1].strip()
            passed = result.returncode == 0 and not mismatch
            failed += not passed
            print(f'{"PASS" if passed else "FAIL"} {slug}/{number}: {result.stdout.strip()}')
            if mismatch:
                print('EXPECTED:', expected[1])
            if result.returncode:
                print(result.stderr)
        except subprocess.TimeoutExpired:
            failed += 1
            print(f'TIMEOUT {slug}/{number}: 120 seconds')
print(f'Executed {executed}, failed {failed}')
sys.exit(bool(failed))

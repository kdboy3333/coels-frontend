$ErrorActionPreference = 'Stop'
$path = 'app\student\results\page.tsx'
$source = [System.IO.File]::ReadAllText((Join-Path (Get-Location) $path))

$oldHeaders = @'
                          <th className="border border-slate-300 px-2 py-3 text-center">
                            CA / 30
                          </th>
                          <th className="border border-slate-300 px-2 py-3 text-center">
                            Exam / 70
                          </th>
                          <th className="border border-slate-300 px-2 py-3 text-center">
                            Total
                          </th>
'@

$oldCells = @'
                            <td className="border border-slate-300 px-2 py-3 text-center">
                              {formatScore(result.ca_score)}
                            </td>

                            <td className="border border-slate-300 px-2 py-3 text-center">
                              {formatScore(result.exam_score)}
                            </td>

                            <td className="border border-slate-300 px-2 py-3 text-center font-extrabold">
                              {formatScore(result.total_score)}
                            </td>
'@

$oldExplanation = @'
                  <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p>
                      <strong>CA:</strong> Continuous Assessment, maximum 30
                      marks.
                    </p>
                    <p className="mt-1">
                      <strong>Exam:</strong> Examination, maximum 70 marks.
                    </p>
                    <p className="mt-1">
                      <strong>Total:</strong> CA plus examination, maximum
                      100 marks.
                    </p>
                    <p className="mt-2 text-xs">
                      Historical results without saved grading snapshots are
                      excluded from GPA calculations until verified. Grades
                      shown above follow the result data returned by COELS.
                    </p>
                  </div>
'@

if (-not $source.Contains($oldHeaders)) { throw 'Expected score headers were not found. No changes written.' }
if (-not $source.Contains($oldCells)) { throw 'Expected score cells were not found. No changes written.' }
if (-not $source.Contains($oldExplanation)) { throw 'Expected score explanation was not found. No changes written.' }

$updated = $source.Replace($oldHeaders, '')
$updated = $updated.Replace($oldCells, '')
$updated = $updated.Replace($oldExplanation, @'
                  <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="text-xs">
                      Historical results without saved grading snapshots are
                      excluded from GPA calculations until verified. Grades
                      shown above follow the result data returned by COELS.
                    </p>
                  </div>
'@)

if ($updated -eq $source) { throw 'No changes were applied.' }

[System.IO.File]::WriteAllText(
  (Join-Path (Get-Location) $path),
  $updated,
  [System.Text.UTF8Encoding]::new($false)
)

Write-Host 'SUCCESS: CA, Exam, and Total hidden from student results display.'
Write-Host 'Grade, course information, credit units, and GPA code preserved.'
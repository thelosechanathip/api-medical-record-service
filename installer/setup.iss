; ===============================
; Medical Record API – Installer (Runtime w/ npm+prisma)
; Update-safe + Silent .env on upgrade
; ===============================

#define MyAppName        "Medical-Record-Audit-API"
#define MyAppVersion     "1.0.1"
#define MyPublisher      "โรงพยาบาลอากาศอำนวย"
#define NodeDirName      "node"
#define EntryFile        "server.js"

[Setup]
AppId={{A3B8C5E4-9E77-4C6F-9B5A-2A0B1D22F11C}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyPublisher}
AppCopyright=Copyright (C) 2025 {#MyPublisher}– กลุ่มงานสุขภาพดิจิทัล. All rights reserved.
DefaultDirName={commonpf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
WizardStyle=modern
WizardResizable=yes
WizardSizePercent=140
Compression=lzma2
SolidCompression=yes
SetupIconFile="icons\moph.ico"
PrivilegesRequired=admin
CloseApplications=yes
CloseApplicationsFilter=node.exe
ArchitecturesInstallIn64BitMode=x64compatible
OutputBaseFilename=MRA-API-Setup-{#MyAppVersion}
DisableDirPage=no
UsePreviousAppDir=yes
VersionInfoCompany={#MyPublisher}
VersionInfoDescription={#MyAppName} Installer
VersionInfoProductName={#MyAppName}
VersionInfoVersion={#MyAppVersion}

[Languages]
Name: "thai"; MessagesFile: "compiler:Languages\Thai.isl"
; Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "fw"; Description: "เพิ่มกฎ Firewall ให้พอร์ต API"; Flags: checkedonce
Name: "desktop"; Description: "วางไอคอนสำหรับรัน API ไว้บน Desktop"; Flags: checkedonce

[Dirs]
Name: "{app}\logs"; Flags: uninsalwaysuninstall

[Files]
Source: "..\build\*"; DestDir: "{app}\build"; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "..\package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\package-lock.json"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "..\server.js"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "..\prisma\*"; DestDir: "{app}\prisma"; Flags: recursesubdirs createallsubdirs ignoreversion skipifsourcedoesntexist
Source: "..\public\*";  DestDir: "{app}\public";  Flags: recursesubdirs createallsubdirs ignoreversion skipifsourcedoesntexist
Source: "..\config\*";  DestDir: "{app}\config";  Flags: recursesubdirs createallsubdirs ignoreversion skipifsourcedoesntexist
Source: "..\views\*";   DestDir: "{app}\views";   Flags: recursesubdirs createallsubdirs ignoreversion skipifsourcedoesntexist
Source: "..\certs\*";   DestDir: "{app}\certs";   Flags: recursesubdirs createallsubdirs ignoreversion skipifsourcedoesntexist
Source: "..\{#NodeDirName}\*"; DestDir: "{app}\{#NodeDirName}"; Flags: recursesubdirs createallsubdirs ignoreversion skipifsourcedoesntexist
Source: ".\helpers\mysql_set_native_password.sql"; DestDir: "{app}\helpers"; Flags: ignoreversion skipifsourcedoesntexist
Source: ".\icons\moph.ico"; DestDir: "{app}\icons"; Flags: ignoreversion

[Icons]
Name: "{group}\Start API (Development)"; Filename: "{app}\start-dev.bat"; WorkingDir: "{app}"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{group}\Start API (Production)"; Filename: "{app}\start-prod.bat"; \
  WorkingDir: "{app}"; IconFilename: "{app}\icons\moph.ico"; IconIndex: 0

Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\start-prod.bat"; \
  WorkingDir: "{app}"; Tasks: desktop; \
  IconFilename: "{app}\icons\moph.ico"; IconIndex: 0

; ถ้าต้องการให้ Dev ก็ด้วย
Name: "{group}\Start API (Development)"; Filename: "{app}\start-dev.bat"; \
  WorkingDir: "{app}"; IconFilename: "{app}\icons\moph.ico"; IconIndex: 0

[UninstallDelete]
Type: files;          Name: "{app}\.env"
Type: filesandordirs; Name: "{app}\logs"
Type: filesandordirs; Name: "{app}\*"
Type: dirifempty;     Name: "{app}"

[Code]
var
  Page1, Page2, Page3: TInputQueryWizardPage;
  chkFirewall, chkHidePwd: TNewCheckBox;
  PromptW1, PromptW2, PromptW3: Integer;
  HasExistingEnv: Boolean;
  UpdateMode: Boolean;  // <- โหมดอัปเดต

const
  DEF_BASE = 'api/mra';
  DEF_PORT = '11098';

  MARGIN_L = 0;
  GAP_LABEL = 16;
  GAP_ROW = 10;
  MARGIN_R = 12;
  EDIT_LEFT_MIN = 280;
  EDIT_WIDTH_MIN = 480;
  LABEL_PAD = 8;

  P1_COUNT = 5;
  P2_COUNT = 6;
  P3_COUNT = 5;

function MaxI(a, b: Integer): Integer;
begin
  if a > b then Result := a else Result := b;
end;

function GetDefaultSecret(): String;
begin
  Result := 'secret_' + GetDateTimeString('yyyymmddhhnnss', #0, #0);
end;

function ComputePromptWidth(Page: TInputQueryWizardPage; Count: Integer): Integer;
var i, w, maxw: Integer;
begin
  maxw := 0;
  for i := 0 to Count - 1 do begin
    Page.PromptLabels[i].AutoSize := True;
    w := Page.PromptLabels[i].Width;
    if w > maxw then maxw := w;
  end;
  Result := maxw + ScaleX(LABEL_PAD);
end;

procedure BalanceInputs(Page: TInputQueryWizardPage; FixedPromptWidth, Count: Integer);
var i, editLeft, editWidth, topY, pageWidth: Integer;
begin
  pageWidth := Page.SurfaceWidth;
  editLeft  := MARGIN_L + FixedPromptWidth + ScaleX(GAP_LABEL);
  editLeft  := MaxI(editLeft, EDIT_LEFT_MIN);
  editWidth := pageWidth - editLeft - ScaleX(MARGIN_R);
  editWidth := MaxI(editWidth, EDIT_WIDTH_MIN);
  topY := ScaleY(8);
  for i := 0 to Count - 1 do begin
    Page.PromptLabels[i].AutoSize := False;
    Page.PromptLabels[i].Left := ScaleX(MARGIN_L);
    Page.PromptLabels[i].Top := topY + ScaleY(4);
    Page.PromptLabels[i].Width := FixedPromptWidth;

    Page.Edits[i].Left := editLeft;
    Page.Edits[i].Top := topY;
    Page.Edits[i].Width := editWidth;

    topY := topY + Page.Edits[i].Height + ScaleY(GAP_ROW);
  end;
end;

procedure ReflowAllPages;
begin
  if Page1 <> nil then BalanceInputs(Page1, PromptW1, P1_COUNT);
  if Page2 <> nil then BalanceInputs(Page2, PromptW2, P2_COUNT);
  if Page3 <> nil then BalanceInputs(Page3, PromptW3, P3_COUNT);
end;

procedure WizardResized(Sender: TObject);
begin
  ReflowAllPages;
end;

function ReadAllText(const FileName: string): string;
var
  Buf: AnsiString;
begin
  if LoadStringFromFile(FileName, Buf) then
    Result := String(Buf)
  else
    Result := '';
end;

function TrimStr(const S: string): string;
begin
  Result := Trim(S);
end;

function EnvGet(Text, Key, Fallback: string): string;
var
  EOL, EqPos: Integer;
  Line, LVal: string;
begin
  Result := Fallback;
  while True do begin
    if Text = '' then Break;
    EOL := Pos(#13#10, Text);
    if EOL = 0 then begin
      Line := Text; Text := '';
    end else begin
      Line := Copy(Text, 1, EOL - 1);
      Delete(Text, 1, EOL + 1);
    end;
    EqPos := Pos('=', Line);
    if (EqPos > 0) and (Copy(Line,1,Length(Key)) = Key) then begin
      LVal := Copy(Line, Length(Key) + 2, MaxInt);
      Result := TrimStr(LVal);
      Exit;
    end;
  end;
end;

procedure TryLoadExistingEnv;
var
  EnvPath, S: string;
begin
  HasExistingEnv := False;
  EnvPath := ExpandConstant('{app}') + '\.env';
  if FileExists(EnvPath) then begin
    S := ReadAllText(EnvPath);
    if S <> '' then begin
      Page1.Values[0] := EnvGet(S, 'BASE_PATH', Page1.Values[0]);
      Page1.Values[1] := EnvGet(S, 'PORT', Page1.Values[1]);
      Page1.Values[2] := EnvGet(S, 'OTP_EXPIRED', Page1.Values[2]);
      Page1.Values[3] := EnvGet(S, 'TOKEN_EXPIRED', Page1.Values[3]);
      Page2.Values[0] := EnvGet(S, 'DB_HOST', Page2.Values[0]);
      Page2.Values[1] := EnvGet(S, 'DB_PORT', Page2.Values[1]);
      Page2.Values[2] := EnvGet(S, 'DB_USER', Page2.Values[2]);
      Page2.Values[3] := EnvGet(S, 'DB_PASSWORD', Page2.Values[3]);
      Page2.Values[4] := EnvGet(S, 'DB_NAME_MRA', Page2.Values[4]);
      Page2.Values[5] := EnvGet(S, 'DB_NAME_BACKOFFICE', Page2.Values[5]);
      Page3.Values[0] := EnvGet(S, 'DB_HOST_H', Page3.Values[0]);
      Page3.Values[1] := EnvGet(S, 'DB_PORT_H', Page3.Values[1]);
      Page3.Values[2] := EnvGet(S, 'DB_USER_H', Page3.Values[2]);
      Page3.Values[3] := EnvGet(S, 'DB_PASSWORD_H', Page3.Values[3]);
      Page3.Values[4] := EnvGet(S, 'DB_NAME_H', Page3.Values[4]);
      HasExistingEnv := True;
    end;
  end;
end;

function BuildDatabaseURL(User, Pass, Host, Port, DBName: String): String;
begin
  Result := 'mysql://' + User + ':' + Pass + '@' + Host + ':' + Port + '/' + DBName;
end;

function GetNodeBin(WorkDir: String): String;
begin
  if FileExists(WorkDir + '\{#NodeDirName}\node.exe') then
    Result := '"' + WorkDir + '\{#NodeDirName}\node.exe"'
  else
    Result := 'node';
end;

function GetNpmBin(WorkDir: String): String;
begin
  if FileExists(WorkDir + '\{#NodeDirName}\npm.cmd') then
    Result := '"' + WorkDir + '\{#NodeDirName}\npm.cmd"'
  else
    Result := 'npm';
end;

function GetNpxBin(WorkDir: String): String;
begin
  if FileExists(WorkDir + '\{#NodeDirName}\npx.cmd') then
    Result := '"' + WorkDir + '\{#NodeDirName}\npx.cmd"'
  else
    Result := 'npx';
end;

function CheckNodeVersionOk(WorkDir: String): Boolean;
var ResultCode: Integer;
begin
  Result := True;
  if not FileExists(WorkDir + '\{#NodeDirName}\node.exe') then
    if not ShellExec('', GetNodeBin(WorkDir), '-v', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
      Result := False;
end;

procedure CreateRunnerScripts(WorkDir: string);
begin
  SaveStringToFile(WorkDir + '\start-dev.bat',
    '@echo off' + #13#10 +
    'cd /d "%~dp0"' + #13#10 +
    'set "NODEBIN=' + GetNodeBin(WorkDir) + '"' + #13#10 +
    'if exist "%~dp0{#NodeDirName}\npm.cmd" (' + #13#10 +
    '  call "%~dp0{#NodeDirName}\npm.cmd" start' + #13#10 +
    ') else (' + #13#10 +
    '  npm start' + #13#10 +
    ')' + #13#10, False);

  SaveStringToFile(WorkDir + '\start-prod.bat',
    '@echo off' + #13#10 +
    'setlocal enableextensions' + #13#10 +
    'cd /d "%~dp0"' + #13#10 +
    'title MRA API (Production)' + #13#10 +
    'echo Starting API (production)...' + #13#10 +
    'if exist ".\{#NodeDirName}\node.exe" (' + #13#10 +
    '  set "NODEBIN=.\{#NodeDirName}\node.exe"' + #13#10 +
    ') else (' + #13#10 +
    '  set "NODEBIN=node"' + #13#10 +
    ')' + #13#10 +
    'set "APPJS=build\app.js"' + #13#10 +
    'if not exist "%APPJS%" set "APPJS={#EntryFile}"' + #13#10 +
    'if not exist "%APPJS%" (' + #13#10 +
    '  echo ERROR: build output not found. && pause && exit /b 1' + #13#10 +
    ')' + #13#10 +
    'set "NODE_ENV=production"' + #13#10 +
    'set "NODE_OPTIONS=--enable-source-maps"' + #13#10 +
    'set "PORT=11098"' + #13#10 +
    'set "BASE_PATH=api/mra"' + #13#10 +
    'if exist ".env" (' + #13#10 +
    '  for /f "usebackq tokens=1,* delims==" %%A in (".env") do (' + #13#10 +
    '    if /I "%%~A"=="PORT" set "PORT=%%~B"' + #13#10 +
    '    if /I "%%~A"=="BASE_PATH" set "BASE_PATH=%%~B"' + #13#10 +
    '  )' + #13#10 +
    ')' + #13#10 +
    'echo.' + #13#10 +
    'echo API URLs:' + #13#10 +
    'echo   http://127.0.0.1:%PORT%/%BASE_PATH%' + #13#10 +
    'echo.' + #13#10 +
    'if not exist ".\logs" mkdir ".\logs"' + #13#10 +
    'set "LOGFILE=.\logs\api.log"' + #13#10 +
    'echo [%date% %time%] Booting "%APPJS%" > "%LOGFILE%"' + #13#10 +
    '"%NODEBIN%" "%APPJS%" >> "%LOGFILE%" 2>&1' + #13#10 +
    'if errorlevel 1 (' + #13#10 +
    '  echo API stopped with error. ดู "%LOGFILE%"' + #13#10 +
    '  pause' + #13#10 +
    ') else (' + #13#10 +
    '  echo API exited normally.' + #13#10 +
    '  pause' + #13#10 +
    ')' + #13#10,
  False);
end;

procedure WriteEnvFile(WorkDir, DBURL: string);
var
  EnvText, EnvPath, BakPath: string;
  RC: Integer;
begin
  EnvPath := WorkDir + '\.env';
  if HasExistingEnv and FileExists(EnvPath) then Exit;

  EnvText :=
    'BASE_PATH=' + Page1.Values[0] + #13#10 +
    'PORT=' + Page1.Values[1] + #13#10 +
    'OTP_EXPIRED=' + Page1.Values[2] + #13#10 +
    'TOKEN_EXPIRED=' + Page1.Values[3] + #13#10 +
    'SECRET_KEY=' + Page1.Values[4] + #13#10 + #13#10 +
    '# Database MRA & Backoffice' + #13#10 +
    'DB_HOST=' + Page2.Values[0] + #13#10 +
    'DB_PORT=' + Page2.Values[1] + #13#10 +
    'DB_USER=' + Page2.Values[2] + #13#10 +
    'DB_PASSWORD=' + Page2.Values[3] + #13#10 +
    'DB_NAME_MRA=' + Page2.Values[4] + #13#10 +
    'DB_NAME_BACKOFFICE=' + Page2.Values[5] + #13#10 + #13#10 +
    '# Database HOSxP' + #13#10 +
    'DB_HOST_H=' + Page3.Values[0] + #13#10 +
    'DB_PORT_H=' + Page3.Values[1] + #13#10 +
    'DB_USER_H=' + Page3.Values[2] + #13#10 +
    'DB_PASSWORD_H=' + Page3.Values[3] + #13#10 +
    'DB_NAME_H=' + Page3.Values[4] + #13#10 + #13#10 +
    'DATABASE_URL="' + DBURL + '"' + #13#10;

  if FileExists(EnvPath) then begin
    BakPath := EnvPath + '.bak';
    CopyFile(EnvPath, BakPath, False);
  end;

  SaveStringToFile(EnvPath, EnvText, False);

  ShellExec('', ExpandConstant('{cmd}'),
    '/c attrib +H +S ".env"', WorkDir, SW_HIDE, ewWaitUntilTerminated, RC);
  ShellExec('', ExpandConstant('{cmd}'),
    '/c icacls ".env" /inheritance:r /grant:r Administrators:(F) "%USERNAME%":(R)',
    WorkDir, SW_HIDE, ewWaitUntilTerminated, RC);
end;

procedure DoPostInstall(WorkDir: string);
var
  ResultCode: Integer;
  NPMBIN, NPXBIN: string;
  HasMigrations: Boolean;
begin
  NPMBIN := GetNpmBin(WorkDir);
  NPXBIN := GetNpxBin(WorkDir);

  ShellExec('', NPMBIN, 'install --omit=dev --no-audit --no-fund',
    WorkDir, SW_SHOWMINNOACTIVE, ewWaitUntilTerminated, ResultCode);

  HasMigrations := DirExists(WorkDir + '\prisma\migrations');

  if HasMigrations then
    ShellExec('', NPXBIN, 'prisma migrate deploy',
      WorkDir, SW_SHOWMINNOACTIVE, ewWaitUntilTerminated, ResultCode)
  else
    ShellExec('', NPXBIN, 'prisma db push',
      WorkDir, SW_SHOWMINNOACTIVE, ewWaitUntilTerminated, ResultCode);

  ShellExec('', NPXBIN, 'prisma generate',
    WorkDir, SW_SHOWMINNOACTIVE, ewWaitUntilTerminated, ResultCode);
end;

{ --------- NEW: ตรวจและข้าม .env wizard เมื่อเป็นอัปเดต --------- }
function DetectExistingInstall(): Boolean;
begin
  Result :=
    FileExists(ExpandConstant('{app}\.env')) or
    FileExists(ExpandConstant('{app}\start-prod.bat')) or
    DirExists(ExpandConstant('{app}\node_modules'));
end;

function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := False;

  if (Page1 <> nil) and (PageID = Page1.ID) then begin
    UpdateMode := DetectExistingInstall();
    if UpdateMode then begin
      TryLoadExistingEnv;   { โหลดค่าเดิมเข้า memory }
      Result := True;       { ข้าม Page1 }
    end;
  end
  else if (Page2 <> nil) and (PageID = Page2.ID) then
    Result := UpdateMode
  else if (Page3 <> nil) and (PageID = Page3.ID) then
    Result := UpdateMode;
end;

{ --------------------------------------------------------------- }

procedure InitializeWizard;
begin
  WizardForm.OnResize := @WizardResized;

  Page1 := CreateInputQueryPage(
    wpSelectDir,
    'ตั้งค่า API',
    'กำหนดค่าเซิร์ฟเวอร์และความปลอดภัย',
    'กรอกค่าพื้นฐานสำหรับระบบ API'
  );
  Page1.Add('BASE_PATH', False);
  Page1.Add('PORT', False);
  Page1.Add('OTP_EXPIRED (วินาที)', False);
  Page1.Add('TOKEN_EXPIRED (เช่น 8h)', False);
  Page1.Add('SECRET_KEY', False);

  Page1.Values[0] := DEF_BASE;
  Page1.Values[1] := DEF_PORT;
  Page1.Values[2] := '300';
  Page1.Values[3] := '8h';
  Page1.Values[4] := GetDefaultSecret();

  PromptW1 := ComputePromptWidth(Page1, P1_COUNT);
  BalanceInputs(Page1, PromptW1, P1_COUNT);

  Page2 := CreateInputQueryPage(
    Page1.ID,
    'ตั้งค่า Database (MRA & Backoffice)',
    'ระบุข้อมูลเชื่อมต่อ MySQL/MariaDB',
    'ฐานข้อมูลสำหรับระบบ MRA และ Backoffice'
  );
  Page2.Add('DB_HOST', False);
  Page2.Add('DB_PORT', False);
  Page2.Add('DB_USER', False);
  Page2.Add('DB_PASSWORD', True);
  Page2.Add('DB_NAME_MRA', False);
  Page2.Add('DB_NAME_BACKOFFICE', False);

  Page2.Values[0] := 'localhost';
  Page2.Values[1] := '3306';
  Page2.Values[2] := 'root';
  Page2.Values[3] := '';
  Page2.Values[4] := '';
  Page2.Values[5] := '';

  PromptW2 := ComputePromptWidth(Page2, P2_COUNT);
  BalanceInputs(Page2, PromptW2, P2_COUNT);

  Page3 := CreateInputQueryPage(
    Page2.ID,
    'ตั้งค่า HOSxP และ Firewall',
    'ฐานข้อมูล HOSxP และตัวเลือกไฟร์วอลล์',
    'ระบุค่าการเชื่อมต่อ HOSxP'
  );
  Page3.Add('DB_HOST_H', False);
  Page3.Add('DB_PORT_H', False);
  Page3.Add('DB_USER_H', False);
  Page3.Add('DB_PASSWORD_H', True);
  Page3.Add('DB_NAME_H', False);

  Page3.Values[0] := 'localhost';
  Page3.Values[1] := '3306';
  Page3.Values[2] := 'root';
  Page3.Values[3] := '';
  Page3.Values[4] := '';

  PromptW3 := ComputePromptWidth(Page3, P3_COUNT);
  BalanceInputs(Page3, PromptW3, P3_COUNT);

  chkFirewall := TNewCheckBox.Create(Page3.Surface);
  chkFirewall.Parent := Page3.Surface;
  chkFirewall.Left := Page3.Edits[0].Left;
  chkFirewall.Top  := Page3.SurfaceHeight - chkFirewall.Height - ScaleY(6);
  chkFirewall.Width := Page3.SurfaceWidth - chkFirewall.Left - ScaleX(12);
  chkFirewall.Caption := 'เพิ่มกฎ Firewall ให้พอร์ตนี้';
  chkFirewall.Checked := True;

  chkHidePwd := TNewCheckBox.Create(Page3.Surface);
  chkHidePwd.Parent := Page3.Surface;
  chkHidePwd.Left := chkFirewall.Left;
  chkHidePwd.Top := chkFirewall.Top - chkHidePwd.Height - ScaleY(4);
  chkHidePwd.Width := chkFirewall.Width;
  chkHidePwd.Caption := 'ซ่อนรหัสผ่าน/ซ่อน .env + จำกัดสิทธิ์ (แนะนำ)';
  chkHidePwd.Checked := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  WorkDir, DBURL: string;
  ResultCode: Integer;
  DoneMsg: string;
begin
  if CurStep = ssPostInstall then
  begin
    WorkDir := ExpandConstant('{app}');

    if not CheckNodeVersionOk(WorkDir) then
      MsgBox('คำเตือน: ไม่พบ Node.js 22+ บนระบบ และไม่มีโฟลเดอร์ \node ติดมาด้วย อาจรันไม่ได้', mbError, MB_OK);

    DBURL := BuildDatabaseURL(
      Page2.Values[2],
      Page2.Values[3],
      Page2.Values[0],
      Page2.Values[1],
      Page2.Values[4]
    );
    WriteEnvFile(WorkDir, DBURL);
    CreateRunnerScripts(WorkDir);

    ShellExec('', ExpandConstant('{sys}\netsh.exe'),
      'advfirewall firewall delete rule name="MRA API"',
      '', SW_HIDE, ewWaitUntilTerminated, ResultCode);

    if WizardIsTaskSelected('fw') or (chkFirewall.Checked) then
      ShellExec('', ExpandConstant('{sys}\netsh.exe'),
        'advfirewall firewall add rule name="MRA API" dir=in action=allow protocol=TCP localport=' + Page1.Values[1],
        '', SW_HIDE, ewWaitUntilTerminated, ResultCode);

    DoPostInstall(WorkDir);

    if UpdateMode then DoneMsg := 'อัปเดตเสร็จสิ้น!'
                  else DoneMsg := 'ติดตั้งเสร็จสิ้น!';

    MsgBox(
      DoneMsg + #13#10 +
      'ไฟล์รัน: start-prod.bat / start-dev.bat' + #13#10 +
      'ไอคอน Desktop (ถ้าเลือกไว้) พร้อมใช้งาน' + #13#10 +
      'หมายเหตุ: ไฟล์ .env ถูกซ่อนและจำกัดสิทธิ์เรียบร้อย',
      mbInformation, MB_OK
    );
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  RC: Integer;
begin
  if CurUninstallStep = usUninstall then
    ShellExec('', ExpandConstant('{sys}\netsh.exe'),
      'advfirewall firewall delete rule name="MRA API"',
      '', SW_HIDE, ewWaitUntilTerminated, RC);
end;

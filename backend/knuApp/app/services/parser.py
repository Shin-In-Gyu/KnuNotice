# app/services/parsers.py
import json
import html as html_lib
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from app.core.config import BASE, INFO_URL

# app/services/parsers.py (일부 수정)
def parse_notice_list(html_text: str):
    soup = BeautifulSoup(html_text, "html.parser")
    items = []
    
    # 공지사항 목록의 각 행(tr)을 기준으로 순회하는 것이 날짜 뽑기에 유리합니다.
    rows = soup.select("table tbody tr")
    for row in rows:
        a_tag = row.select_one("a.detailLink[data-params]")
        if not a_tag: continue

        # 1. 날짜 추출 (보통 4번째 또는 5번째 td에 위치)
        # 학교 사이트 구조에 따라 td:nth-of-type 숫자를 조정하세요.
        date_el = row.select_one("td.date, td:nth-of-type(5)") 
        posted_at_str = date_el.get_text(strip=True) if date_el else None

        title = a_tag.get_text(" ", strip=True)
        raw_params = html_lib.unescape(a_tag.get("data-params", "")).strip()

        try:
            params = json.loads(raw_params.replace("'", '"'))
            article_id = str(params.get("encMenuBoardSeq")) # 고유 ID
            
            detail_url = (
                f"{INFO_URL}?scrtWrtYn={'true' if params.get('scrtWrtYn') else 'false'}"
                f"&encMenuSeq={params.get('encMenuSeq')}&encMenuBoardSeq={article_id}"
            )
            
            items.append({
                "article_id": article_id,
                "title": title,
                "detail_url": detail_url,
                "posted_at": posted_at_str  # 여기서 날짜 전달
            })
        except:
            continue
    return items

def parse_notice_detail(html: str):
    soup = BeautifulSoup(html, "html.parser")
    # 좀 더 견고한 셀렉터 우선순위 전략
    title_el = soup.select_one(".view_title, .board_view_title, h3, h2, .title")
    content_el = soup.select_one(".view_cont, .board_view, .contents, #contents")
    
    files = []
    for a in soup.select('a[href*="download"], a[href*="FileDown"]'):
        href = a.get("href")
        if href:
            files.append({"name": a.get_text(strip=True), "url": urljoin(BASE, href)})
            
    return {
        "title": title_el.get_text(strip=True) if title_el else "제목 없음",
        "content": content_el.get_text("\n", strip=True) if content_el else "",
        "files": files
    }
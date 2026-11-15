import os

def build_site():
    header_path = "includes/header.html"
    footer_path = "includes/footer.html"
    output_dir = "docs"
    
    if not os.path.exists(header_path) or not os.path.exists(footer_path):
        print("hey! your header or footer is missing, dummy! make sure it's in includes/")
        return

    with open(header_path, "r", encoding="utf-8") as f:
        header = f.read()
    with open(footer_path, "r", encoding="utf-8") as f:
        footer = f.read()

    for filename in os.listdir("pages"):
        if filename.endswith(".html"):
            page_name = filename[:-5]
            
            if page_name == "index":
                title = "about me - aloelucidity"
                active_file = "index.html"
            else:
                title = f"{page_name.replace('-', ' ')} - aloelucidity"
                active_file = filename

            current_header = header
            current_header = current_header.replace("<title></title>", f"<title>{title}</title>")
            
            target_link = f'href="{active_file}"'
            replacement_link = f'class="current" href="{active_file}"'
            current_header = current_header.replace(target_link, replacement_link)

            with open(os.path.join("pages", filename), "r", encoding="utf-8") as f:
                body = f.read()
            
            full_page = current_header + "\n" + body + "\n" + footer
            
            with open(os.path.join(output_dir, filename), "w", encoding="utf-8") as f:
                f.write(full_page)
            print(f"successfully built docs/{filename}!")

if __name__ == "__main__":
    build_site()
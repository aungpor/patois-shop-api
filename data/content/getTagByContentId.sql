SELECT pt.tag_id, pt.tag_name FROM patois_bind_tag pbt
LEFT JOIN patois_content pc WITH (NOLOCK) ON pc.content_id = pbt.ref_id
LEFT JOIN patois_tag pt WITH (NOLOCK) ON pt.tag_id = pbt.tag_id
WHERE pc.content_id = @content_id
AND pbt.ref_type = 'CONTENT'
AND pt.active = 1
INSERT INTO patois_bind_tag (ref_id,
    ref_type,
    tag_id
)
VALUES (@ref_id,
    @ref_type,
    @tag_id
);

SELECT SCOPE_IDENTITY() AS bindTagId
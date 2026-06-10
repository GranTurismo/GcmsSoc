using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace GcmsSoc.API.Models
{
    public class Diary
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Author { get; set; } = string.Empty;

        [Required]
        [MaxLength(25)]
        public string Date { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");

        public List<DiaryComment> Comments { get; set; } = new();
    }

    public class DiaryComment
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string DiaryId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Avatar { get; set; } = string.Empty;

        [Required]
        public string Text { get; set; } = string.Empty;

        [Required]
        [MaxLength(25)]
        public string Date { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
    }
}

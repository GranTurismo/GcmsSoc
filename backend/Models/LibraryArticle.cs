using System;
using System.ComponentModel.DataAnnotations;

namespace GcmsSoc.API.Models
{
    public class LibraryArticle
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Author { get; set; } = "admin";

        [Required]
        [MaxLength(25)]
        public string Date { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");

        public int Views { get; set; }
    }
}

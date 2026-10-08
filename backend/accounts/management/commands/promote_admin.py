from django.core.management.base import BaseCommand, CommandError
from accounts.models import Account


class Command(BaseCommand):
    help = "Promote an Account to admin (or demote with --demote)."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True, help="Account email address")
        parser.add_argument("--demote", action="store_true",
                            help="Remove admin instead of granting it")

    def handle(self, *args, **options):
        try:
            account = Account.objects.get(email=options["email"])
        except Account.DoesNotExist:
            raise CommandError(f"No Account found with email {options['email']!r}")
        account.is_admin = not options["demote"]
        account.save(update_fields=["is_admin", "updated_at"])
        state = "demoted from admin" if options["demote"] else "promoted to admin"
        self.stdout.write(self.style.SUCCESS(f"{account.email} {state}."))
